import Link from "next/link";
import Navigation from "./components/Navigation";

export default function Home() {
  return (
    <div>
      <nav>
        <Navigation />
      </nav>
      <h1>The Wild Oasis. Welcome to paradise!</h1>
    </div>
  );
}
