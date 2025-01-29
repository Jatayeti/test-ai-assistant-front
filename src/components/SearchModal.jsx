import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

export default function SearchModal({ results, onClose }) {
    if (!results) return null;

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-gray-900 text-white rounded-2xl shadow-lg p-6 max-w-lg w-full flex flex-col"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
            >
                {/* Заголовок модалки */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FiSearch className="text-blue-400 text-3xl" /> Search Results
                    </h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-red-500 transition duration-200">
                        <IoClose size={28} />
                    </button>
                </div>

                {/* Результаты поиска */}
                <ul className="space-y-3">
                    {results.length > 0 ? (
                        results.map((item, index) => (
                            <li key={index} className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300">
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    {item.title}
                                </a>
                                <p className="text-sm text-gray-400 mt-1">{item.snippet || "No description available."}</p>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-400 text-center">No results found.</p>
                    )}
                </ul>

                {/* Кнопка закрытия */}
                <button
                    className="mt-6 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
                    onClick={onClose}
                >
                    Закрыть
                </button>
            </motion.div>
        </motion.div>
    );
}
