import React from "react";

const TVFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(180deg, #8b4513, #ff8c00)", // Warm fall gradient
        backgroundImage: "url('/assets/fall-background.jpg')", // Add a fall-themed background image
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Outer Frame */}
      <div
        style={{
          position: "relative",
          width: "80%",
          maxWidth: "1200px",
          height: "70%",
          maxHeight: "800px",
          margin: "auto",
          border: "10px solid #ff007a",
          borderRadius: "15px",
          boxShadow: "0 0 25px #ff007a, 0 0 50px #ff007a",
          background: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden", // Ensure scanlines and content stay contained
        }}
      >
        {/* Scanlines as part of the TV Background */}
        <div
          className="scanlines"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none", // Ensure it doesn’t block interactions
            zIndex: 1, // Behind static content
          }}
        />

        {/* Inner Frame */}
        <div
          style={{
            width: "95%",
            height: "95%",
            border: "5px solid #00e0ff",
            borderRadius: "10px",
            boxShadow: "0 0 15px #00e0ff, 0 0 30px #00e0ff",
            backgroundColor: "#111",
            position: "relative",
            zIndex: 5, // Above the scanlines
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default TVFrame;
