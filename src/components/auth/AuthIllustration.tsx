export default function AuthIllustration() {
	return (
		<svg
			viewBox="0 0 500 600"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-full h-full max-h-[600px]"
		>
			<defs>
				<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#5B6BF8" />
					<stop offset="100%" stopColor="#9B59F5" />
				</linearGradient>
				<linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#5B6BF8" stopOpacity="0.15" />
					<stop offset="100%" stopColor="#9B59F5" stopOpacity="0.05" />
				</linearGradient>
				<filter id="glow">
					<feGaussianBlur stdDeviation="3" result="blur" />
					<feComposite in="SourceGraphic" in2="blur" operator="over" />
				</filter>
			</defs>

			{/* Background circles */}
			<circle cx="250" cy="300" r="220" fill="url(#grad2)" />
			<circle cx="250" cy="300" r="160" fill="url(#grad2)" />

			{/* Outer ring */}
			<circle
				cx="250"
				cy="300"
				r="200"
				stroke="url(#grad1)"
				strokeWidth="0.5"
				strokeDasharray="6 4"
				opacity="0.3"
			/>
			<circle
				cx="250"
				cy="300"
				r="145"
				stroke="url(#grad1)"
				strokeWidth="0.5"
				strokeDasharray="4 6"
				opacity="0.2"
			/>

			{/* Central lock body */}
			<rect
				x="190"
				y="270"
				width="120"
				height="100"
				rx="16"
				fill="url(#grad1)"
				opacity="0.95"
			/>

			{/* Lock shackle */}
			<path
				d="M215 270 L215 245 Q215 210 250 210 Q285 210 285 245 L285 270"
				stroke="url(#grad1)"
				strokeWidth="14"
				strokeLinecap="round"
				fill="none"
			/>

			{/* Lock keyhole */}
			<circle cx="250" cy="312" r="12" fill="white" opacity="0.9" />
			<rect
				x="245"
				y="318"
				width="10"
				height="18"
				rx="4"
				fill="white"
				opacity="0.9"
			/>

			{/* Message bubble — top left */}
			<g transform="translate(60, 140)">
				<rect
					x="0"
					y="0"
					width="130"
					height="52"
					rx="14"
					fill="url(#grad1)"
					opacity="0.9"
				/>
				<rect
					x="0"
					y="42"
					width="22"
					height="16"
					rx="4"
					fill="url(#grad1)"
					opacity="0.9"
				/>
				<rect
					x="12"
					y="16"
					width="70"
					height="8"
					rx="4"
					fill="white"
					opacity="0.6"
				/>
				<rect
					x="12"
					y="30"
					width="48"
					height="6"
					rx="3"
					fill="white"
					opacity="0.35"
				/>
			</g>

			{/* Message bubble — top right */}
			<g transform="translate(300, 110)">
				<rect
					x="0"
					y="0"
					width="110"
					height="44"
					rx="14"
					fill="white"
					opacity="0.08"
				/>
				<rect
					x="88"
					y="34"
					width="22"
					height="16"
					rx="4"
					fill="white"
					opacity="0.08"
				/>
				<rect
					x="12"
					y="13"
					width="55"
					height="7"
					rx="3"
					fill="white"
					opacity="0.25"
				/>
				<rect
					x="12"
					y="26"
					width="38"
					height="5"
					rx="2.5"
					fill="white"
					opacity="0.15"
				/>
			</g>

			{/* Message bubble — bottom left */}
			<g transform="translate(48, 390)">
				<rect
					x="0"
					y="0"
					width="120"
					height="48"
					rx="14"
					fill="white"
					opacity="0.07"
				/>
				<rect
					x="0"
					y="38"
					width="20"
					height="14"
					rx="4"
					fill="white"
					opacity="0.07"
				/>
				<rect
					x="12"
					y="13"
					width="62"
					height="7"
					rx="3"
					fill="white"
					opacity="0.2"
				/>
				<rect
					x="12"
					y="26"
					width="42"
					height="5"
					rx="2.5"
					fill="white"
					opacity="0.12"
				/>
			</g>

			{/* Message bubble — bottom right */}
			<g transform="translate(298, 400)">
				<rect
					x="0"
					y="0"
					width="140"
					height="56"
					rx="14"
					fill="url(#grad1)"
					opacity="0.85"
				/>
				<rect
					x="118"
					y="46"
					width="22"
					height="16"
					rx="4"
					fill="url(#grad1)"
					opacity="0.85"
				/>
				<rect
					x="14"
					y="16"
					width="80"
					height="8"
					rx="4"
					fill="white"
					opacity="0.6"
				/>
				<rect
					x="14"
					y="30"
					width="55"
					height="6"
					rx="3"
					fill="white"
					opacity="0.35"
				/>
			</g>

			{/* Floating dots — orbit */}
			{[0, 60, 120, 180, 240, 300].map((angle, i) => {
				const rad = (angle * Math.PI) / 180;
				const cx = 250 + 200 * Math.cos(rad);
				const cy = 300 + 200 * Math.sin(rad);
				const r = i % 2 === 0 ? 5 : 3.5;
				return (
					<circle
						key={angle}
						cx={cx}
						cy={cy}
						r={r}
						fill="url(#grad1)"
						opacity={i % 2 === 0 ? 0.7 : 0.35}
					/>
				);
			})}

			{/* Shield badge — bottom center */}
			<g transform="translate(222, 460)">
				<path
					d="M28 0 L56 10 L56 30 Q56 50 28 60 Q0 50 0 30 L0 10 Z"
					fill="url(#grad1)"
					opacity="0.9"
				/>
				<path
					d="M16 30 L24 38 L40 22"
					stroke="white"
					strokeWidth="3.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</g>

			{/* Connecting lines from lock to bubbles */}
			<line
				x1="190"
				y1="300"
				x2="145"
				y2="200"
				stroke="url(#grad1)"
				strokeWidth="0.8"
				opacity="0.2"
				strokeDasharray="4 4"
			/>
			<line
				x1="310"
				y1="290"
				x2="355"
				y2="155"
				stroke="url(#grad1)"
				strokeWidth="0.8"
				opacity="0.2"
				strokeDasharray="4 4"
			/>
			<line
				x1="195"
				y1="340"
				x2="130"
				y2="415"
				stroke="url(#grad1)"
				strokeWidth="0.8"
				opacity="0.2"
				strokeDasharray="4 4"
			/>
			<line
				x1="305"
				y1="350"
				x2="350"
				y2="425"
				stroke="url(#grad1)"
				strokeWidth="0.8"
				opacity="0.2"
				strokeDasharray="4 4"
			/>
		</svg>
	);
}
