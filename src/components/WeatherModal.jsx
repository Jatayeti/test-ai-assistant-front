import { motion } from "framer-motion";
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiThunderstorm } from "react-icons/wi";

const weatherIcons = {
    Clear: <WiDaySunny className="text-yellow-400 text-6xl" />,
    Clouds: <WiCloud className="text-gray-400 text-6xl" />,
    Rain: <WiRain className="text-blue-400 text-6xl" />,
    Snow: <WiSnow className="text-blue-200 text-6xl" />,
    Thunderstorm: <WiThunderstorm className="text-purple-500 text-6xl" />,
    Default: <WiCloud className="text-gray-400 text-6xl" />
};

export default function WeatherModal({ weather, onClose }) {
    if (!weather) return null;

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-gray-900 text-white rounded-2xl shadow-lg p-6 max-w-md w-full flex flex-col items-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
            >
                {/* Иконка погоды */}
                {weatherIcons[weather.condition] || weatherIcons["Default"]}

                <h2 className="text-2xl font-bold mt-4">{weather.location}</h2>
                <p className="text-xl text-gray-300">{weather.description}</p>
                <p className="text-4xl font-semibold mt-2">{weather.temperature}°C</p>

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
