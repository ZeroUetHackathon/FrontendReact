// import "./Signup.css"
import facebook from "../../assets/images/facebook.png"
import google from "../../assets/images/google.png"

const Signup = () => {
    return (
        <div class="v9_260">
            <div class="v9_278">
                <span class="v9_262">Sign Up</span>
                <span class="v9_263">Email Id</span>
                <span class="v9_265">Password</span>
                <span class="v11_326">Confirm your password</span>
                <div class="v9_267">
                    <input class="v9_268 login-field-text"></input>
                </div>
                <div class="v9_270">
                    <div class="v9_271"></div>
                    <input class="v9_271 login-field-text"></input>
                </div>
                <div class="v11_325">
                    <div class="v9_274"></div>
                    <button class="v9_274">
                        <span class="v9_275">Create accout</span>
                    </button>
                    <button class="v9_273">
                        <div class="v9_276">Sign In</div>
                    </button>
                </div>
            </div>
            <div class="v9_277">
                <div class="v9_261"></div>
                <span class="v9_264">You have an account ?</span>
                <button class="v9_276 v9_273">
                    Sign In
                </button>
            </div>
            <div class="v11_322">
                <div class="v11_323"></div>
                <input class="v11_323 login-field-text"></input>
            </div>
            <p class="or-">- OR -</p>
            <div class="v10-307">
                <button class="v10-308">
                    <img src={facebook} class="v10-310"></img>
                    <span class="v10-309">Continue with Facebook</span>
                </button>
            </div>
            <div class="v10-311">
                <button class="v10-308">
                    <img src={google} class="v10-310"></img>
                    <span class="v10-309">Continue with Google</span>
                </button>
            </div>
        </div>
    )
}

export default Signup;
