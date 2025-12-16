import React from 'react'
import bgVideo from "../assets/product.png"; 
const Hero1 = () => {
  return (
    <div>
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background Video */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fadeIn">
            Welcome to <span className="text-blue-400">ShopEase</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-6 text-gray-200 animate-fadeIn delay-100">
            Discover premium products, exclusive deals, and a shopping
            experience made just for you.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 animate-fadeIn delay-200">
            Start Shopping
          </button>
        </div>
      </section>
    </div>
  );
}

export default Hero1
