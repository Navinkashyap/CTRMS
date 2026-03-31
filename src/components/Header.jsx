import React, { useState } from "react";

const Header = ({ onToggleSidebar }) => {
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <header
      style={{
        height: 52,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 18,
          color: "#374151",
          padding: "4px 6px",
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Toggle sidebar"
      >
        <i className="fa-solid fa-bars" />
      </button>

      <div style={{ flex: 1 }} />

      {/* User profile */}
      <div
        style={{ position: "relative" }}
        onMouseLeave={() => setDropOpen(false)}
      >
        <button
          onClick={() => setDropOpen((p) => !p)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          {/* Avatar placeholder */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7c9dff,#3c5fc0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            PK
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#4a6fd4" }}>
            Piyush Kumar
          </span>
          <i
            className="fa-solid fa-angle-down"
            style={{ fontSize: 11, color: "#4a6fd4" }}
          />
        </button>

        {dropOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 44,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              minWidth: 160,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 200,
            }}
          >
            {["Profile", "Settings", "Logout"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  display: "block",
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#374151",
                  textDecoration: "none",
                  borderBottom: "1px solid #f3f4f6",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f0f4ff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
