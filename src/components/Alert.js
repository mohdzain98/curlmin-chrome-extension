import React from "react";

export default function Alert(props) {
  const icons = {
    primary: "fa-bell",
    info: "fa-circle-info",
    success: "fa-circle-check",
    danger: "fa-circle-exclamation",
  };
  return (
    <div>
      <div className="border">
        {props.alert && (
          <div
            className={`alert alert-${props.alert.type} alert-dismissible fade show fixed-top`}
            role="alert"
            style={{ width: "50%" }}
          >
            <strong>
              <i className={`fa-solid ${icons[props.alert.type]} me-2`}></i>
            </strong>{" "}
            {props.alert.msg}
          </div>
        )}
      </div>
    </div>
  );
}
