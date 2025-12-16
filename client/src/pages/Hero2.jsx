import React from "react";
import { products } from "../data/products.js";
import productImage from "../assets/product.png"; 

const Hero2 = () => {
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Featured Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition duration-300"
            >
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-gray-800 font-bold text-lg mb-2">
                  ${product.price}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  Brand: {product.brand}
                </p>
                <p className="text-sm text-yellow-500">
                  ⭐ {product.rating} ({product.numReviews} reviews)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero2;
