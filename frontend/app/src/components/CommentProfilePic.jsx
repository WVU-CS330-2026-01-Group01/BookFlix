const pics = import.meta.glob('../assets/profile_pics/*.png', { eager: true });
const profilePicSources = Object.values(pics).map(pic => pic.default);

function CommentProfilePic({ pfpIndex = 0, username = "User" }) {
  // Comments may contain older avatar indexes; fall back to the default image
  // instead of rendering a broken profile picture.
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
