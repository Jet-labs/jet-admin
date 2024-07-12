import "./App.css";
import Composer from "./components/Composer";
import AppRouter from "./components/Router";
function App() {
  return (
    <Composer>
      <AppRouter />
    </Composer>
  );
}

export default App;
