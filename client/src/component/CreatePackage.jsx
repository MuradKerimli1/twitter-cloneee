import { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { FaCheck, FaPlus, FaTrash } from "react-icons/fa";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { setPackages } from "../store/slices/auth.slice";
import { useDispatch, useSelector } from "react-redux";

const CreatePackage = ({ close }) => {
  const { packages } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [featureInput, setFeatureInput] = useState("");
  const [packageData, setPackageData] = useState({
    name: "",
    price: 0,
    description: "",
    durationInDays: 0,
    features: [],
    currency: "USD",
  });
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPackageData((prev) => ({ ...prev, [name]: value }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setPackageData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (index) => {
    setPackageData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await Axios({
        ...summaryApi.createPackage,
        data: packageData,
      });

      if (res.data.success) {
        const updatedPackagesData = [...packages, res.data.package];
        dispatch(setPackages(updatedPackagesData));
        setPackageData({
          name: "",
          price: 0,
          description: "",
          durationInDays: 30,
          features: [],
          currency: "AZN",
        });
        close();
      }
    } catch (error) {
      axiosError(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#15202B] p-6 rounded-xl border border-[#2F3336] max-h-[90vh] overflow-y-auto">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <IoCloseSharp size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Create New Package</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Package Name
            </label>
            <input
              type="text"
              name="name"
              value={packageData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#253341] border border-[#38444D] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Premium Gold"
              required
            />
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={packageData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#253341] border border-[#38444D] rounded-lg"
                placeholder="19.99"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Duration (Days)
              </label>
              <input
                type="number"
                name="durationInDays"
                value={packageData.durationInDays}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#253341] border border-[#38444D] rounded-lg"
                placeholder="30"
                min="1"
                required
              />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Currency
            </label>
            <select
              name="currency"
              value={packageData.currency}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#253341] border border-[#38444D] rounded-lg"
              required
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={packageData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#253341] border border-[#38444D] rounded-lg min-h-[100px]"
              placeholder="Package benefits and details..."
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Features
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#253341] border border-[#38444D] rounded-lg"
                placeholder="Add feature (e.g., Profile Analytics)"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <FaPlus /> Add
              </button>
            </div>

            {/* Features List */}
            <div className="mt-2 space-y-2">
              {packageData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#253341] p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    <span>{feature}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 cursor-pointer bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : null}
              Create Package
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreatePackage;
