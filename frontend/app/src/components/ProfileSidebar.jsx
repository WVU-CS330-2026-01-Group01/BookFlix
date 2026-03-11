import React from "react";


function ProfileSidebar() {
  return (
    <div style={styles.container}>
     
      <img
        src="https://i.pravatar.cc/100"
        alt="profile"
        style={styles.avatar}
      />


      <h2 style={styles.title}>Profile</h2>


      <div style={styles.bookmarks}>
        <span style={styles.icon}>🔖</span>
        <span>Bookmarks</span>
      </div>

    </div>
  );
  }

const styles = {
  container: {
    width: "200px",
    padding: "20px",
    borderRadius: "12px",
    border: "2px solid white",
    textAlign: "center",
    color: "white",
    backgroundColor: "#2a2a2a"
  },

  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    marginBottom: "10px"
  },

  title: {
    margin: "10px 0"
  },

  bookmarks: {
     marginTop: "15px",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    fontSize: "16px"
  },

  icon: {
    fontSize: "18px"
  }
};


export default ProfileSidebar;
