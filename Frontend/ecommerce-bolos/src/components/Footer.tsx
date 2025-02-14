import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-soft-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-playfair text-xl mb-4">Sweet Delights</h3>
            <p className="text-gray-400">
              Handcrafted sweets and cakes for your special moments.
            </p>
          </div>
          
          <div>
            <h4 className="font-playfair text-lg mb-4">Contact</h4>
            <p className="text-gray-400">Email: contact@sweetdelights.com</p>
            <p className="text-gray-400">Phone: (555) 123-4567</p>
          </div>
          
          <div>
            <h4 className="font-playfair text-lg mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 Sweet Delights. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}