import React, { useEffect, useState, useContext } from "react";
import { userContext } from "../context/userContext";

const Popup = (props) => {
  const { host, showAlert } = props.prop;
  const [isLogin, setIsLogin] = useState(false);
  const [login, setLogin] = useState(false);
  const [url, setUrl] = useState({
    longUrl: "",
    pass: false,
    time: "per",
    passval: "",
  });
  const [surl, setSurl] = useState(false);
  const [surlval, setSurlval] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const context = useContext(userContext);
  const {
    getToken,
    user,
    userIdRef,
    getUser,
    createShortUrl,
    creationDate,
    expiryDate,
    isValidUrl,
  } = context;
  const userId = userIdRef.current === "" ? "default" : userIdRef.current;

  useEffect(() => {
    async function getData() {
      // const result = localStorage.getItem("curlmin_ce_token");
      const result = await getToken();
      if (result) {
        console.log("Token Found");
        getUser();
        setIsLogin(true);
      } else {
        console.log("No token found");
      }
    }
    getData();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    try {
      const response = await fetch(`${host}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      console.log("got response", response);
      if (response.status === 500) {
        showAlert("Internal Server Error Occurred", "danger");
        setLoader(false);
      } else {
        const json = await response.json();
        if (json.success) {
          //save the token and redirect
          chrome.storage.local.set({ curlmin_ce_token: json.authToken });
          // localStorage.setItem("curlmin_ce_token", json.authToken);
          showAlert("Login Sucessfully", "success");
          getUser();
          setLogin(false);
          setIsLogin(true);
        } else {
          showAlert(json.errors, "danger");
        }
      }
    } catch (error) {
      showAlert("Server Error Occurred", "danger");
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  const handleCreate = async () => {
    console.log("inside handleCreate");
    setLoader(true);
    if (url.longUrl === "") {
      showAlert("Please Enter URL", "danger");
      return;
    }
    const isValid = isValidUrl(url.longUrl);
    if (!isValid) {
      showAlert("Not a valid url", "danger");
      return;
    }
    try {
      const createdat = creationDate();
      const expiresat = expiryDate(url.time);
      const isPermanent = url.time === "per";
      if (!expiresat) {
        showAlert("Failed to Calculate Expiry date", "danger");
        return;
      }
      const data = await createShortUrl(
        userId,
        url.longUrl,
        url.pass,
        url.passval,
        createdat,
        expiresat,
        isPermanent
      );
      if (data) {
        showAlert(data.message, "success");
        setSurlval(data.shortUrl);
        setSurl(true);
      }
    } catch (error) {
      showAlert("An error occurred during submission", "danger");
    } finally {
      setLoader("");
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(surlval);
      showAlert("copied successfully", "success");
    } catch (error) {
      // console.log(error);
      showAlert("error occurred in copying", "danger");
    }
  };

  const handleSurl = () => {
    setSurl(false);
    setUrl({ longUrl: "", time: "", pass: false, passval: "" });
    setSurlval("");
  };

  return (
    <div className="container p-4" style={{ width: "400px" }}>
      <div>
        <div>
          <h4 style={{ marginBottom: "0px" }}>
            curlmin
            {isLogin && (
              <div class="dropdown float-end">
                <p
                  class="btn btn-default dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  🙎‍♂️
                </p>
                <ul class="dropdown-menu">
                  <li style={{ paddingBottom: "-1px" }}>
                    <h5
                      class="dropdown-item"
                      style={{ fontSize: "14px", paddingBottom: "0px" }}
                    >
                      {user.name}
                      <p
                        className="text-muted"
                        style={{ fontSize: "12px", paddingBottom: "0px" }}
                      >
                        {user.email}
                      </p>
                    </h5>
                  </li>
                  <li className="d-flex justify-content-center">
                    <button
                      className="btn btn-link btn-sm"
                      style={{ fontSize: "13px" }}
                      onClick={() => {
                        chrome.storage.local.remove("curlmin_ce_token");
                        chrome.storage.local.remove("curlmin_ce_uid");
                        setIsLogin(false);
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </h4>
        </div>
        <div>
          {!isLogin && !login && (
            <p className="text-muted" style={{ fontSize: "13px" }}>
              <span
                className="me-1"
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => setLogin(true)}
              >
                Login
              </span>
              to Save your shortened URLs.
            </p>
          )}
        </div>
      </div>
      {!login ? (
        <div>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Paste URL here"
            value={url.longUrl}
            onChange={(e) => setUrl({ ...url, longUrl: e.target.value })}
          />
          <div className="row g-1 mb-3">
            <div className="col-5">
              <select
                className="form-select"
                id="activeTime"
                value={url.time}
                onChange={(e) => setUrl({ ...url, time: e.target.value })}
                disabled={surl ? true : false}
              >
                <option value="per" selected>
                  Permanent
                </option>
                <option value="12">12 Hours</option>
                {/* <option value="2min">2 Minutes</option> */}
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="7d">7 Days</option>
                <option value="1m">1 Month </option>
                <option value="6m">6 Month</option>
                <option value="12m">12 Month</option>
              </select>
            </div>
            <div className="col-7">
              <div className="input-group ">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="No Password"
                  value={url.passval}
                  onChange={(e) =>
                    setUrl({ ...url, pass: true, passval: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="input-group-text bg-light border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "🦉"}
                </button>
              </div>
            </div>
          </div>
          {surl && (
            <div>
              <label htmlFor="text" className="form-label small fw-semibold">
                ShortUrl
              </label>
              <div className="input-group" style={{ width: "70%" }}>
                <input
                  type="text"
                  className={`form-control`}
                  value={surlval}
                  onChange={surlval}
                />
                <button
                  type="button"
                  className="input-group-text bg-light border-start-0"
                  onClick={handleCopy}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Copy"
                >
                  🗐
                </button>
              </div>
            </div>
          )}
          {!surl ? (
            <button
              className="btn btn-warning btn-sm"
              onClick={handleCreate}
              disabled={url.longUrl === "" || loader}
            >
              <i className="fas fa-link me-2"></i>
              {loader ? (
                <span>
                  Shortening..
                  <span className="spinner-border spinner-border-sm ms-1"></span>
                </span>
              ) : (
                "Shorten"
              )}
            </button>
          ) : (
            <button
              className="btn btn-secondary btn-sm mt-3"
              onClick={handleSurl}
            >
              Shorten Another
            </button>
          )}
        </div>
      ) : (
        <div>
          <button
            className="btn btn-default btn-sm"
            onClick={() => setLogin(false)}
          >
            ← back
          </button>
          <div className="p-2">
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-1">
                <label htmlFor="email" className="form-label small fw-semibold">
                  Email Address
                </label>
                <div className="input-group input-group-sm">
                  <input
                    type="email"
                    name="email"
                    className="form-control bg-light text-dark"
                    id="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-2">
                <label
                  htmlFor="password"
                  className="form-label small fw-semibold"
                >
                  Password
                </label>
                <div className="input-group input-group-sm">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-light text-dark"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "🦉"}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="d-flex justify-content-end align-items-end mb-3">
                <a
                  href="/"
                  className="text-decoration-none text-muted small"
                  onClick={(e) => {
                    e.preventDefault();
                    chrome.tabs.create({
                      url: "https://curlmin.com/forgot-password",
                    });
                  }}
                >
                  Forgot Password?
                </a>
              </div>
              {/* Submit Button */}
              <div className="d-flex justify-content-center mb-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-4"
                  disabled={email === "" || password === "" || loader}
                >
                  {" "}
                  Sign In
                  {loader && (
                    <span className="spinner-border spinner-border-sm ms-2"></span>
                  )}
                </button>
              </div>

              {/* Sign Up Link */}
              <p
                className="text-center mb-1 text-muted fw-semibold"
                style={{ fontSize: "14px" }}
              >
                Don't have an account?{" "}
                <a
                  href="/"
                  className="text-decoration-none text-primary "
                  onClick={(e) => {
                    e.preventDefault();
                    chrome.tabs.create({ url: "https://curlmin.com/signup" });
                  }}
                >
                  Sign Up
                </a>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
