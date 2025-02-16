import React, { useState, useEffect, useRef } from "react";
import { userContext } from "./userContext";

const UserState = (props) => {
  const { host, showAlert } = props.prop;
  const [user, setUser] = useState({
    name: "",
    email: "",
    type: "",
    time: "",
  });
  const [userId, setUserId] = useState("");
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const getToken = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["curlmin_ce_token"], (result) => {
        resolve(result.curlmin_ce_token || ""); // Return token or empty string
      });
    });
  };

  const getUser = async () => {
    try {
      const token = await getToken();
      // const token = localStorage.getItem("culrmin_ce_token");
      const response = await fetch(`${host}/auth/getuser`, {
        method: "POST",
        headers: {
          "auth-token": token,
        },
      });

      const json = await response.json();
      setUser({
        name: json.name,
        email: json.email,
        type: json.userType,
        time: json.creationDate,
      });
      setUserId(json._id);
      chrome.storage.local.set({ curlmin_ce_uid: json._id });
      // localStorage.setItem("curlmin_ce_uid", json._id);
    } catch (err) {
      showAlert(err, "danger");
    }
  };
  const createShortUrl = async (
    userId,
    url,
    pass,
    passval,
    creationdate,
    formattedDate,
    isPermanent
  ) => {
    try {
      const resp = await fetch(`${host}/url/createurl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          longUrl: url,
          pass: pass,
          passval: passval,
          creationDate: creationdate,
          expiryDate: formattedDate,
          isPermanent: isPermanent,
        }),
      });
      if (resp.status === 500) {
        showAlert("There is an error generating short url", "danger");
        return false;
      } else {
        const data = await resp.json();
        return data;
      }
    } catch (error) {
      showAlert("an error accurred accessing server", "danger");
    }
  };

  const creationDate = () => {
    const cDate = new Date();

    const pad = (num) => String(num).padStart(2, "0");
    const year = cDate.getFullYear();
    const month = pad(cDate.getMonth() + 1);
    const day = pad(cDate.getDate());
    const hours = pad(cDate.getHours());
    const minutes = pad(cDate.getMinutes());
    const seconds = pad(cDate.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const expiryDate = (time) => {
    if (!time) {
      showAlert("Time is not defined or empty", "danger");
      return 0;
    }
    if (time === "per") {
      return "9998-12-31 23:59:59";
    } else {
      const selectedOption = time.toString();
      const currentDate = new Date();
      const exdate = new Date(currentDate);

      if (selectedOption.endsWith("d")) {
        const daysToAdd = parseInt(selectedOption.replace("d", ""));
        exdate.setDate(exdate.getDate() + daysToAdd);
      } else if (selectedOption.endsWith("m")) {
        const monthsToAdd = parseInt(selectedOption.replace("m", ""));
        exdate.setMonth(exdate.getMonth() + monthsToAdd);
      } else if (selectedOption.endsWith("min")) {
        const minutesToAdd = parseInt(selectedOption.replace("min", ""));
        exdate.setMinutes(exdate.getMinutes() + minutesToAdd);
      } else {
        const hoursToAdd = parseInt(selectedOption);
        exdate.setHours(exdate.getHours() + hoursToAdd);
      }

      const pad = (num) => String(num).padStart(2, "0");
      const year = exdate.getFullYear();
      const month = pad(exdate.getMonth() + 1);
      const day = pad(exdate.getDate());
      const hours = pad(exdate.getHours());
      const minutes = pad(exdate.getMinutes());
      const seconds = pad(exdate.getSeconds());

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  };
  const isValidUrl = (input) => {
    const urlPattern = /^(https?:\/\/)[^\s]+\.[^\s]+$/;
    if (!urlPattern.test(input) || input.includes("curlm.in")) {
      return false;
    }
    try {
      new URL(input);
      return true;
    } catch (error) {
      return false;
    }
  };
  return (
    <div>
      <userContext.Provider
        value={{
          getToken,
          user,
          userIdRef,
          getUser,
          createShortUrl,
          creationDate,
          expiryDate,
          isValidUrl,
        }}
      >
        {props.children}
      </userContext.Provider>
    </div>
  );
};

export default UserState;
