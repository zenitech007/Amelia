export default function NurseAvatar({ size = 32 }) {
  return (
    <img 
      // To use your own image later, save it in your `public` folder as amelia.png 
      // and change this src to: src="/amelia.png"
      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150&auto=format&fit=crop" 
      alt="Amelia" 
      style={{ width: size, height: size, objectFit: 'cover' }}
      className="rounded-full shadow-sm"
    />
  );
}