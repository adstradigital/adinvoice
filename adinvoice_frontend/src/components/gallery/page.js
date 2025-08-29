export default function GalleryPage() {
  // Sample images (you can replace with your own URLs)
  const images = [
    "https://picsum.photos/400/300?random=1",
    "https://picsum.photos/400/300?random=2",
    "https://picsum.photos/400/300?random=3",
    "https://picsum.photos/400/300?random=4",
    "https://picsum.photos/400/300?random=5",
    "https://picsum.photos/400/300?random=6",
  ];

  return (
    <div className="container">
      <h1 className="text-center my-4">Gallery</h1>
      <div className="row">
        {images.map((src, index) => (
          <div key={index} className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <img src={src} className="card-img-top" alt={`Gallery ${index}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
