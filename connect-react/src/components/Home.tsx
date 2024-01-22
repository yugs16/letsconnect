import { useState } from "react";
import Platform from './components/Platform';
import '../App.css'

export default function Home() {
	
	const [name, setName] = useState('');
	const [proceed, setProceed] = useState(false)
	return (
		<>
			<label>Enter Name: </label>
			<input
				type="text"
				max={3}
				required
				onChange={(e) => setName(e.target.value)}
				placeholder="Enter your connect name"
			></input>
			<button onClick={() => setProceed(true)} className="proceed">
				Proceed
			</button>

			{name && proceed && <Platform name={name} />}
		</>
	);
}
