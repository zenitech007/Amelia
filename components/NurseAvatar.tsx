export default function NurseAvatar({ size = 32 }: { size?: number }) {
  return (
    <img 
      src="/amelia.png" 
      alt="Amelia" 
      style={{ width: size, height: size, objectFit: 'cover' }}
      className="rounded-full shadow-sm"
    />
  );
}