const pics = import.meta.glob('../assets/profile_pics/*.png', { eager: true });
const profilePicSources = Object.values(pics).map(pic => pic.default);

function CommentProfilePic({ pfpIndex = 0, username = "User" }) {
  return (
    <img
      src={profilePicSources[pfpIndex] ?? profilePicSources[0]}
      alt={`${username}'s profile`}
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
  );
}

export default CommentProfilePic;
