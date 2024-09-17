import "./Login.css";
import facebook from "../../assets/images/facebook.png"
import google from "../../assets/images/google.png"

const Login = () => {
	return (
		<>
			<div className="auth--sidebar" style={{ left: "50%" }}>
				<span className="auth--sidebar__header">Don’t have account yet?</span>
				<button className="auth--sidebar__button">
					Create Account
				</button>
			</div>
			<div className="auth--main" style={{ left: "8%" }}>
				<span className="auth--main__title">Sign In</span>
				<div className="auth--main__input--container">
					<span className="auth--main__input--header">Email Id</span>
					<br />
					<input className="auth--main__input--input" placeholder="Enter your email address" />
				</div>
				<div className="auth--main__input--container">
					<span className="auth--main__input--header">Password</span>
					<br />
					<input className="auth--main__input--input" placeholder="Enter your password" />
				</div>
				<span className="v9_248 forgot-password">Forgotten Password</span>
				<button className="v9_256 login-small-button">Login Now</button>
				<p class="or">- OR -</p>
				<div class="v10_307">
					<button class="v10_308">
						<img src={facebook} class="v10_310"></img>
						<span class="v10_309">Continue with Facebook</span>
					</button>
				</div>
				<div class="v10_311">
					<button class="v10_308">
						<img src={google} class="v10_310"></img>
						<span class="v10_309">Continue with Google</span>
					</button>
				</div>
			</div>
		</>
	);
};
export default Login;
