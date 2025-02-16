import { useState } from "react";
import "./App.css";
import UserState from "./context/UserState";
import Popup from "./components/Popup";
import Alert from "./components/Alert";

function App() {
  const [alert, setAlert] = useState(null);
  const host = process.env.REACT_APP_HOST;

  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type,
    });
    setTimeout(() => {
      setAlert(null);
    }, 3500);
  };

  return (
    <>
      <UserState prop={{ host, showAlert }}>
        <Alert alert={alert} />
        <Popup prop={{ host, showAlert }} />
      </UserState>
    </>
  );
}

export default App;
