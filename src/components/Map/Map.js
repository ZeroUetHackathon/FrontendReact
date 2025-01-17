import React, { useState } from "react";
import * as d3 from "d3";
import $ from "jquery";
import * as topojson from "topojson-client";

// hooks
import { useD3 } from "../../hooks/useD3";

// styles
import { canvasStyle } from "./style";
import "../../styles/map.css";
function Map({ chosenProvince, setChosenProvince }) {
  const [calledUseD3, setCalledUseD3] = useState(false);
  const [currentProvince, setCurrentProvince] = useState("");
  useD3(
    () => {
      let width = (window.innerWidth / 100) * 31,
        height = (window.innerHeight / 100) * 72;
      let active = d3.select(null);
      let zoomScale, zoomTranslate;

      // We create a quantile scale to categorize the values in 5 groups.
      // The domain is static and has a minimum/maximum of population/density.
      // The scale returns text values which can be used for the color CSS
      // classes (q0-9, q1-9 ... q8-9)
      let quantiles = d3.scale.quantile().range(
        d3.range(9).map(function (i) {
          return "q" + i + "-9";
        })
      );

      let svg, g, path, zoom, projection, tooltip;

      $(function () {
        // Area, population and population density in 2011 by province
        // get from https://www.gso.gov.vn
        // Average population (Thous. pers.)/Area (Km2)/Population density (Person/km2)
        // Load in popuplation data with D3 (or jQuery)
        d3.select("#loading").classed("hidden", false);

        tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
          .on("click", stopped, true);

        d3.csv(
          "https://raw.githubusercontent.com/gponster/d3tuts/master/vn-population-2011.csv",
          function (error, rows) {
            if (error) {
              return console.warn(error);
            }

            loadTopoJson(rows);
          }
        );
      });

      function loadTopoJson(data) {
        // @see http://www.gadm.org/
        // GADM is a spatial database of the location of the world's
        // administrative areas (or adminstrative boundaries) for use in GIS and similar software.
        // @see http://mapshaper.org/ for simplify
        // A tool for topologically aware shape simplification. Reads and
        // writes Shapefile, GeoJSON and TopoJSON formats.
        d3.json(
          "https://raw.githubusercontent.com/gponster/d3tuts/master/vn-states.json",
          function (error, json) {
            if (error) {
              return console.warn(error);
            }

            d3.select("#loading").classed("hidden", true);

            // While our data can be stored more efficiently in TopoJSON,
            // we must convert back to GeoJSON for display.
            let features = topojson.feature(json, json.objects.states).features;

            // Merge the ag. data and GeoJSON
            // Loop through once for each ag. data value
            for (let i = 0; i < data.length; i++) {
              // Grab state name
              let dataIso = data[i].iso;
              // Grab data value, and convert from string to float
              let density = parseFloat(data[i].density);
              let population = parseFloat(data[i].population);
              let area = parseFloat(data[i].area);

              //Find the corresponding state inside the GeoJSON
              for (let j = 0; j < features.length; j++) {
                let jsonIso = features[j].properties.iso;
                if (dataIso === jsonIso) {
                  // Copy the data value into the JSON
                  features[j].properties.density = density;
                  features[j].properties.population = population;
                  features[j].properties.area = area;

                  // Stop looking through the JSON
                  break;
                }
              }
            }

            // Set the domain of the values
            quantiles.domain(
              features.map(function (d) {
                return d.properties.density;
              })
            );

            let legend = d3
              .select(".bar-legend")
              .append("svg")
              .attr("width", 240)
              .attr("height", 12);

            legend
              .selectAll("rect")
              .data(
                d3.range(9).map(function (i) {
                  return "q" + i + "-9";
                })
              )
              .enter()
              .append("rect")
              .attr("width", 240 / 9)
              .attr("height", 12)
              .attr("x", function (d, i) {
                return (240 / 9) * i;
              })
              .attr("data-level", function (d, i) {
                return i;
              })
              .attr("class", function (d) {
                return "legend " + d;
              })
              .on("mouseover", function (type) {
                d3.selectAll(".legend").style("opacity", 0.3);
                d3.select(this).style("opacity", 1);

                let level = d3.select(this).attr("data-level");

                d3.selectAll(".feature")
                  .style("opacity", 0.1)
                  .filter(".q" + level + "-9")
                  .style("opacity", 1);

                d3.selectAll(".bubble")
                  .style("fill-opacity", 0.1)
                  .filter(".q" + level + "-9")
                  .style("fill-opacity", 0.75);

                d3.selectAll(".state-boundary").style("stroke-opacity", 0.3);
              })
              .on("mouseout", function (type) {
                d3.selectAll(".legend").style("opacity", 1);
                d3.selectAll(".feature").style("opacity", 1);
                d3.selectAll(".bubble").style("fill-opacity", 0.75);

                d3.selectAll(".state-boundary").style("stroke-opacity", 1);
              });

            drawMap(json, features);
            drawScatterplot(features);
          }
        );
      }

      function drawScatterplot(data) {
        let margin = {
          top: 20,
          right: 10,
          bottom: 80,
          left: 40,
        };
        let w = 270 - margin.left - margin.right;
        let h = 270 - margin.top - margin.bottom;

        let scatter = d3
          .select(".scatterplot-wrapper")
          .append("svg")
          .attr("width", w + margin.left + margin.right)
          .attr("height", h + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        /// Population (x)
        let xscale = d3.scale
          .linear()
          .domain([
            d3.min(data, function (d) {
              return d.properties.population;
            }),
            d3.max(data, function (d) {
              return d.properties.population;
            }),
          ])
          .range([0, w]);

        // Area (y)
        let yscale = d3.scale
          .linear()
          .domain([
            d3.min(data, function (d) {
              return d.properties.area / 1000;
            }),
            d3.max(data, function (d) {
              return d.properties.area / 1000;
            }),
          ])
          .range([h, 0]);

        let rscale = d3.scale
          .sqrt()
          .domain([
            d3.min(data, function (d) {
              return d.properties.density;
            }),
            d3.max(data, function (d) {
              return d.properties.density;
            }),
          ])
          .range([3, 15]);

        // Define X axis
        let xaxis = d3.svg
          .axis()
          .scale(xscale)
          .orient("bottom")
          .tickSize(-h)
          .tickFormat(d3.format("s"));

        // Define Y axis
        let yaxis = d3.svg
          .axis()
          .scale(yscale)
          .orient("left")
          .ticks(6)
          .tickSize(-w);

        // Create X axis
        scatter
          .append("g")
          .attr("class", "x-axis axis")
          .attr("transform", "translate(0," + h + ")")
          .call(xaxis);

        // Create Y axis
        scatter
          .append("g")
          .attr("class", "y-axis axis")
          .attr("transform", "translate(" + 0 + ",0)")
          .call(yaxis);

        // Add label to X axis
        scatter
          .append("text")
          .attr("class", "x label")
          .attr("text-anchor", "middle")
          .attr("x", w - w / 2)
          .attr("y", h + margin.bottom / 2)
          .text("Population");

        // Add label to Y axis
        scatter
          .append("text")
          .attr("class", "y label")
          .attr("text-anchor", "middle")
          .attr("y", -margin.left + 5)
          .attr("x", 0 - h / 2)
          .attr("dy", "1em")
          .attr("transform", "rotate(-90)")
          .text("Area (1000 km2)");

        let clr = d3.scale.category20();

        let circles = scatter
          .selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", function (d) {
            return xscale(d.properties.population);
          })
          .attr("cy", function (d) {
            return yscale(d.properties.area / 1000);
          })
          .attr("r", function (d) {
            return rscale(d.properties.density);
          })
          .attr("class", function (d) {
            return (
              "bubble state-" +
              d.properties.iso +
              " " +
              quantiles(d.properties.density)
            );
          })
          .on("mouseover", function (d) {
            tooltip.transition().duration(300).style("opacity", 1);

            tooltip
              .text(d.properties.name)
              .style("left", d3.event.pageX + "px")
              .style("top", d3.event.pageY - 50 + "px");
          })
          .on("mouseout", function (d) {
            tooltip.transition().duration(300).style("opacity", 0);
          });
      }

      function drawMap(json, features) {
        // @see http://geojson.org/
        // Create a first guess for the projection
        //let center = d3.geo.centroid(json);
        let center = [106.34899620666437, 16.553160650957434];
        let scale = height * 3.5;
        let offset = [width / 2, height / 2 - 25];

        // The projection function takes a location [longitude, latitude]
        // and returns a Cartesian coordinates [x,y] (in pixels).
        //
        // D3 has several built-in projections. Albers USA is a composite projection
        // that nicely tucks Alaska and Hawaii beneath the Southwest.
        //
        // Albers USA (albersUsa) is actually the default projection for d3.path.geo()
        // The default scale value is 1,000. Anything smaller will shrink the map;
        // anything larger will expand it.
        //
        // Add a scale() method with 800 to our projection in order to shrink things down a bit
        //let projection = d3.geo.albersUsa()
        //     .translate([w / 2, h / 2]).scale([800]);
        projection = d3.geo
          .mercator()
          .translate(offset)
          .scale([scale])
          .center(center);

        // We define our first path generator for translating that
        // mess of GeoJSON coordinates into even messier messes of SVG path codes.
        // Tell the path generator explicitly that it should reference our customized
        // projection when generating all those paths
        path = d3.geo.path().projection(projection);

        zoom = d3.behavior
          .zoom()
          .translate([0, 0])
          .scale(1)
          .scaleExtent([1, 13])
          .on("zoom", zoomed);

        svg = d3
          .select("#map-canvas")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .on("click", stopped, true);

        svg
          .append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on(
            "click",
            function () {
              zoomScale = 1;
              zoomTranslate = [0, 0];

              reset();
            },
            true
          );

        g = svg.append("g");

        // Create g before call zoom

        //-----------------------------------------------------------------
        // For country boundary and state mesh/not data binding
        //-----------------------------------------------------------------
        let boundary = g.append("g").attr("class", "boundary");

        g.attr("class", "states")
          .selectAll("path") // select all the current path nodes
          .data(features) // bind these to the features array in json
          .enter()
          .append("g") // if not enough elements create a new group
          .attr("class", function (d) {
            return "state state-" + d.properties.iso;
          })
          .on("mouseover", function (d) {
            //---------------------------------------------------------
            // Tooltip
            //---------------------------------------------------------
            tooltip.transition().duration(300).style("opacity", 1);

            tooltip
              .text(d.properties.name)
              .style("left", d3.event.pageX + "px")
              .style("top", d3.event.pageY - 50 + "px");
            //---------------------------------------------------------

            //---------------------------------------------------------
            // Feature info
            //---------------------------------------------------------
            $("#feature-info").find("tr:gt(0)").remove();

            let html =
              "<tr><td>" +
              d.properties.name +
              "</td>" +
              "<td>" +
              d.properties.population.toFixed(2) +
              "</td>" +
              "<td>" +
              d.properties.area.toFixed(2) +
              "</td>" +
              "<td>" +
              d.properties.density.toFixed(2) +
              "</td>" +
              "<td>" +
              d.properties.capital +
              "</td></tr>";
            $("#feature-info tr:last").after(html);
            //---------------------------------------------------------

            //---------------------------------------------------------
            // Bubble
            //---------------------------------------------------------
            d3.selectAll(".bubble")
              .style("fill-opacity", 0.1)
              .filter(".state-" + d.properties.iso)
              .classed("highlight", true);
          })
          .on("mouseout", function (d) {
            tooltip.transition().duration(300).style("opacity", 0);

            $("#feature-info").find("tr:gt(0)").remove();

            d3.selectAll(".bubble")
              .style("fill-opacity", 0.75)
              .classed("highlight", false);
          })
          .on("click", clicked)
          .append("path")
          .attr("class", function (d) {
            // Use the quantiled value for the class
            return "feature " + quantiles(d.properties.density);
          }) // add attribute class and fill with result from quantiles
          .attr("d", path);

        //-----------------------------------------------------------------
        // Now we can draw boundary, prevent lost data cause by merging and meshing
        //-----------------------------------------------------------------
        // Country boundary from merge all geometries
        boundary
          .append("path")
          .attr("class", "country-boundary")
          .datum(topojson.merge(json, json.objects.states.geometries))
          .attr("d", path);

        // State mesh
        boundary
          .append("path")
          .attr("class", "state-boundary")
          .datum(
            topojson.mesh(json, json.objects.states, function (a, b) {
              return a !== b;
            })
          )
          .attr("d", path);
        //-----------------------------------------------------------------

        //-----------------------------------------------------------------
        // State names
        //-----------------------------------------------------------------
        g.append("g")
          .attr("class", "state-labels")
          .selectAll("text") // select all the current path nodes
          .data(features)
          .enter()
          .append("text") // if not enough elements create a text
          .attr("class", function (d) {
            // To make contract text
            let className = "state-label state-" + d.properties.iso;
            return className + " " + quantiles(d.properties.density);
          })
          .text(function (d) {
            // Name from bound data we already binded using .data(features)
            return d.properties.name;
          })
          // Using transform equivalent to x, y
          .attr("transform", function (d) {
            return "translate(" + path.centroid(d) + ")";
          })
          //.attr('x', function (d) {
          //    return path.centroid(d)[0];
          //})
          //.attr('y', function (d) {
          //    return path.centroid(d)[1];
          //})
          // The dy attribute indicates a shift along the y-axis on the position
          // of an element or its content. What exactly is shifted
          // depends on the element for which this attribute is set.
          .attr("dy", ".35em");

        drawCities();

        d3.select(window.self.frameElement).style("height", height + "px");
      }

      function drawCities() {
        // Cities group
        g.append("g").attr("class", "cities");

        d3.csv("vn-cities.csv", function (error, rows) {
          if (error) {
            return console.warn(error);
          }

          rows.forEach(function (row, i) {
            // Create new group and binding data
            let sg = g
              .selectAll(".cities")
              .append("g")
              .datum(row)
              .attr("class", function (d) {
                return "city city-" + d.code + " level-" + d.level;
              });

            // Append circle to group of city
            sg.append("circle")
              .attr("class", function (d) {
                return "city-place";
              })
              .attr("visibility", function (d) {
                return d.level < 3 ? "visible" : "hidden";
              })
              .attr("cx", function (d) {
                return projection([d.lng, d.lat])[0];
              })
              .attr("cy", function (d) {
                return projection([d.lng, d.lat])[1];
              })
              .attr("r", 2)
              .style("fill", "white")
              .style("stroke", "black")
              .style("stroke-width", 2)
              .style("opacity", 0.85)
              // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
              // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
              .on("mouseover", function (d) {
                //div.transition()
                //    .duration(200)
                //    .style('opacity', .9);
              })
              // fade out
              .on("mouseout", function (d) {
                //div.transition()
                //    .duration(500)
                //    .style('opacity', 0);
              });

            sg.append("text")
              .attr("class", function (d) {
                return "city-label";
              })
              .text(function (d) {
                return d.name;
              })
              .attr("visibility", function (d) {
                return d.level < 2 ? "visible" : "hidden";
              })
              .attr("x", function (d) {
                return projection([d.lng, d.lat])[0];
              })
              .attr("y", function (d) {
                return projection([d.lng, d.lat])[1];
              })
              .attr("text-anchor", function (d) {
                return d.lng > 105.7 ? "start" : "end";
              })
              .attr("dx", function (d) {
                return (d.lng > 105.7 ? 1 : -1) * 0.7 + "em";
              })
              // The dy attribute indicates a shift along the y-axis on the position
              // of an element or its content. What exactly is shifted
              // depends on the element for which this attribute is set.
              .attr("dy", ".35em");
          });
        });
      }

      function zoomed() {
        g.selectAll(".country-boundary").style(
          "stroke-width",
          1 / d3.event.scale + "px"
        );

        g.selectAll(".feature").style(
          "stroke-width",
          2 / (d3.event.scale + 0.5) + "px"
        );
        g.attr(
          "transform",
          "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"
        );

        g.selectAll(".state-label").style(
          "font-size",
          8 / d3.event.scale + 2 + "px"
        );

        g.selectAll(".city-place")
          .style("r", 1 / d3.event.scale + 0.7)
          .style("stroke-width", 2 / (d3.event.scale + 0.5) + "px");

        g.selectAll(".city-label")
          .style("font-size", 12 / d3.event.scale + 1.5 + "px")
          .attr(
            "dy",
            d3.event.scale === 1
              ? "0.35em"
              : (1 / d3.event.scale) * 0.35 + 0.2 + "em"
          );

        g.selectAll(".level-3 .city-label").style(
          "font-size",
          6 / d3.event.scale + 1.5 + "px"
        );

        g.selectAll(".level-4 .city-label").style(
          "font-size",
          5 / d3.event.scale + 1.5 + "px"
        );

        if (d3.event.scale < 2) {
          g.selectAll(".level-2 .city-label").attr("visibility", "hidden");
        } else {
          g.selectAll(".level-2 .city-label").attr("visibility", "visible");
        }

        if (d3.event.scale < 3.3) {
          g.selectAll(".level-3 .city-label").attr("visibility", "hidden");
          g.selectAll(".level-3 .city-place").attr("visibility", "hidden");

          g.selectAll(".level-4 .city-label").attr("visibility", "hidden");
          g.selectAll(".level-4 .city-place").attr("visibility", "hidden");
        } else {
          g.selectAll(".level-3 .city-label").attr("visibility", "visible");
          g.selectAll(".level-3 .city-place").attr("visibility", "visible");

          g.selectAll(".level-4 .city-label").attr("visibility", "visible");
          g.selectAll(".level-4 .city-place").attr("visibility", "visible");
        }
      }

      // If the drag behavior prevents the default click,
      // also stop propagation so we don’t click-to-zoom.
      function stopped() {
        if (d3.event.defaultPrevented) {
          d3.event.stopPropagation();
        }
      }

      function reset() {
        active.classed("active", false);
        active = d3.select(null);
        setChosenProvince("");
        zoomScale = zoomScale || 1;
        zoomTranslate = zoomTranslate || [0, 0];

        svg
          .transition()
          .duration(750)
          .call(zoom.translate(zoomTranslate).scale(zoomScale).event);
      }

      function clicked(d) {
        const clickedProvince = d.properties.iso;
        // console.log(clickedProvince, currentProvince);
        setChosenProvince(clickedProvince);
        console.log(d);
        if (active.node() === this) {
          return reset();
        }

        active.classed("active", false);
        active = d3.select(this).classed("active", true);

        // Save current zoom and translate
        zoomScale = zoom.scale();
        zoomTranslate = zoom.translate();

        let bounds = path.bounds(d),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = Math.max(
            1,
            Math.min(8, 0.9 / Math.max(dx / width, dy / height))
          ),
          translate = [width / 2 - scale * x, height / 2 - scale * y];

        svg
          .transition()
          .duration(750)
          .call(zoom.translate(translate).scale(scale).event);
      }
    },
    [calledUseD3],
    calledUseD3,
    setCalledUseD3
  );

  return (
    <div id="wrapper">
      {/* <div className="scatterplot-wrapper"></div> */}
      {/* <div className="legend-wrapper">
        <h1 className="title-1">Population density</h1>
        <div className="index-level-bar">
          <div className="bar-legend"></div>
          <div className="bar-label">Lower denisty</div>
          <div className="bar-label second">Higher denisty</div>
          <div style={{ clear: "both" }}></div>
        </div>
      </div> */}
      <div>
        {/* <div id="header-info">
          <span>
            Area, population and population density in 2011 by province
            (https://www.gso.gov.vn)
          </span>
          <table id="feature-info">
            <tbody>
              <tr>
                <th className="name" style={{ width: "25%" }}>
                  Name
                </th>
                <th className="population" style={{ width: "20%" }}>
                  Population
                </th>
                <th className="area" style={{ width: "15%" }}>
                  Area
                </th>
                <th className="density" style={{ width: "15%" }}>
                  Density
                </th>
                <th className="capital" style={{ width: "25%" }}>
                  Capital
                </th>
              </tr>
            </tbody>
          </table>
        </div> */}
        <div id="loading" className="hidden">
          <a className="fa fa-spinner"></a>
        </div>
      </div>
      <div style={canvasStyle} id="map-canvas"></div>
    </div>
  );
}

export default Map;
