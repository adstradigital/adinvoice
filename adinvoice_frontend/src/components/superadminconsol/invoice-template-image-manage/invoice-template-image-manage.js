"use client";
import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function InvoiceTemplateImageManage() {
  const [images, setImages] = useState([
    { id: "1", name: "Template 1", src: "https://via.placeholder.com/300x200?text=Invoice+1" },
    { id: "2", name: "Template 2", src: "https://via.placeholder.com/300x200?text=Invoice+2" },
  ]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newImage = {
        id: Date.now().toString(),
        name: file.name,
        src: URL.createObjectURL(file),
      };
      setImages([...images, newImage]);
    }
  };

  const handleDelete = (id) => {
    setImages(images.filter((img) => img.id !== id));
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🧾 Invoice Template Image Manage</h2>

      {/* Upload Section */}
      <Form.Group className="mb-4">
        <Form.Label><strong>Upload New Template</strong></Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
      </Form.Group>

      {/* Image Gallery */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {images.map((img) => (
          <Col key={img.id}>
            <Card className="shadow-sm">
              <Card.Img variant="top" src={img.src} alt={img.name} />
              <Card.Body>
                <Card.Title>{img.name}</Card.Title>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(img.id)}
                >
                  Delete
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
