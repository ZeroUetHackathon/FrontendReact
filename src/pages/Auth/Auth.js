import facebook from "../../assets/images/facebook.png"
import google from "../../assets/images/google.png"
import React, { useState, useEffect } from "react";
import Login from "../../components/Login/Login";
import Register from "../../components/Signup/Signup";
import "./Auth.css"

const auth = [
	{
		main: {
			title: "Sign In",
			fields: [
				{
					field: 'email',
					header: 'Email',
					placeholder: 'Email your email address'
				},
				{
					field: 'password',
					header: 'Password',
					placeholder: 'Email your password'
				}
			],
			button: 'Login Now'
		},
		sidebar: {
			message: "Don't have an account yet?",
			button: "Create Account",
		},
	},
	{
		main: {
			title: "Sign Up",
			fields: [
				{
					field: 'email',
					header: 'Email',
					placeholder: 'Email your email address'
				},
				{
					field: 'password',
					header: 'Password',
					placeholder: 'Email your password'
				},
				{
					field: 'confirmPassword',
					header: 'Confirm Password',
					placeholder: 'Email your confirm password'
				}
			],
			button: 'Signup Now'
		},
		sidebar: {
			message: "Don't have an account yet?",
			button: "Create Account",
		},
	}
]

const AuthPage = () => {
	// 0 -> Login
	// 1 -> Register
	// 2 -> Forgot Password
	const [authState, setAuthState] = useState(0);

	return (
		<div className="background">
			<div className="auth--container">
				<div className="auth--sidebar" style={authState === 0 ? { left: "50%" } : { right: "50%" }}>
					<span className="auth--sidebar__header">
						{auth[authState].sidebar.message}
					</span>
					<button
						className="auth--sidebar__button"
						onClick={() => {
							if (authState < 2)
								setAuthState(prev => 
									prev === 0 ? 1 : 0
								)
						}}
					>
						{auth[authState].sidebar.button}
					</button>
				</div>
				<div className="auth--main" style={authState === 0 ? { left: "8%" } : { right: "8%" }}>
					<span className="auth--main__title">{auth[authState].main.title}</span>
					{
						auth[authState].main.fields.map(field => (
							<div className="auth--main__input--container" key={field.field} >
								<span className="auth--main__input--header">{field.header}</span>
								<br />
								<input className="auth--main__input--input" placeholder={field.placeholder} name={field.field} />
							</div>
						))
					}
					{
						authState === 0
							? (
								<span
									className="auth--main__forgot-password"
									onClick={() => setAuthState(2)}
								>
									Forgotten Password
								</span>
							)
							: <></>
					}
					<button
						className="auth--main__submit-button"
					>
						{auth[authState].main.button}
					</button>
					<div className="auth--main__or">
						<p className="auth--main__or--seperator">- OR -</p>
						<div className="auth--main__or--social-media__container">
							<div className="auth--main__or--social-media auth--main__or--facebook">
								<button className="auth--main__or--faceboo-button">
									<img src={facebook}></img>
									<span>Continue with Facebook</span>
								</button>
							</div>
							<div className="auth--main__or--social-media auth--main__or--google">
								<button className="auth--main__or--google-button">
									<img src={google}></img>
									<span>Continue with Google</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AuthPage;
