import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { setPackages, setUser } from "../store/slices/auth.slice";
import { axiosError } from "../error/axiosError";
import {
  FaCrown,
  FaCheck,
  FaClock,
  FaEllipsisV,
  FaStar,
  FaGem,
  FaRocket,
} from "react-icons/fa";
import CreatePackage from "./CreatePackage";
import UpdatePackage from "./UpdatePackage";

const PremiumPackage = () => {
  const { user, packages } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [packageToUpdate, setPackageToUpdate] = useState(null);
  const [buyLoading, setBuyLoading] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const response = await Axios({ ...summaryApi.fetchPackages });
        if (response.data.success) {
          dispatch(setPackages(response.data.packages));
        }
      } catch (err) {
        setError(err.message);
        axiosError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [dispatch]);

  const handleDeletePackage = async (id) => {
    setLoading(true);
    try {
      const res = await Axios({ ...summaryApi.deletePackage(id) });
      if (res.data.success) {
        const updatedPackages = packages.filter((pkg) => pkg.id !== id);
        dispatch(setPackages(updatedPackages));
      }
    } catch (err) {
      setError(err.message);
      axiosError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (packageId) => {
    setBuyLoading(packageId);
    try {
      const res = await Axios({
        ...summaryApi.packetOrder,
        data: { packageId },
      });

      const { url } = res.data;

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      axiosError(err);
    } finally {
      setBuyLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 h-screen overflow-y-auto">
      {loading && (
        <div className="flex items-center justify-center my-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {error && (
        <div className="alert alert-error max-w-md mx-auto my-8">
          <span>{error}</span>
        </div>
      )}

      {!loading && packages?.length === 0 && (
        <div className="text-center my-8">
          <FaCrown className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-500">Henüz paket yok</h3>
          <p className="text-gray-400 mt-2">
            Premium paketler yakında eklenecek
          </p>
        </div>
      )}

      {!loading && packages?.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Premium Paketler</h2>
            <p className="text-gray-500">
              Özel avantajlardan yararlanmak için paketinizi seçin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  pkg.name.toLowerCase().includes("premium")
                    ? "border-2 border-yellow-400"
                    : "border border-gray-700"
                }`}
              >
                {pkg.name.toLowerCase().includes("premium") && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-3 py-1 text-xs font-bold rounded-bl-lg z-10">
                    POPÜLER
                  </div>
                )}

                <div className="bg-gray-800 p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        {pkg.name.toLowerCase().includes("basic") && (
                          <FaStar className="text-blue-400 mr-2 text-xl" />
                        )}
                        {pkg.name.toLowerCase().includes("premium") && (
                          <FaGem className="text-yellow-400 mr-2 text-xl" />
                        )}
                        {pkg.name.toLowerCase().includes("pro") && (
                          <FaRocket className="text-purple-400 mr-2 text-xl" />
                        )}
                        <h3 className="text-xl font-bold text-white">
                          {pkg.name}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {pkg.description || "Özel avantajlar paketi"}
                      </p>
                    </div>

                    {user.role === "ADMIN" && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpenId((prev) =>
                              prev === pkg.id ? null : pkg.id
                            )
                          }
                          className="text-gray-400 hover:text-white cursor-pointer"
                        >
                          <FaEllipsisV />
                        </button>

                        {menuOpenId === pkg.id && (
                          <div className="absolute right-0 top-8 bg-gray-700 border border-gray-600 rounded-lg z-50 w-32 shadow-lg">
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                setPackageToUpdate(pkg);
                                setOpenUpdate((prev) => !prev);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                handleDeletePackage(pkg.id);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-600"
                            >
                              Sil
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="my-6">
                    <span className="text-4xl font-bold text-white">
                      {pkg.price} {pkg.currency}
                    </span>
                    <span className="text-gray-400">
                      {" "}
                      / {pkg.durationInDays} gün
                    </span>
                  </div>

                  <div className="mb-8 flex-grow">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaCheck className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-300">
                          {pkg.durationInDays} gün geçerli
                        </span>
                      </li>
                      {pkg.features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheck className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuy(pkg.id)}
                    className={`w-full py-3 px-6 rounded-lg font-bold text-center transition-all ${
                      pkg.name.toLowerCase().includes("premium")
                        ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } ${
                      buyLoading === pkg.id
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={buyLoading === pkg.id}
                  >
                    {buyLoading === pkg.id ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Hemen Satın Al"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {user.role === "ADMIN" && (
            <div className="w-full mt-5">
              <button
                onClick={() => setOpenCreate((prev) => !prev)}
                className="w-full btn btn-primary text-center"
              >
                Create
              </button>
            </div>
          )}
        </div>
      )}

      {openCreate && <CreatePackage close={() => setOpenCreate(false)} />}
      {openUpdate && (
        <UpdatePackage
          close={() => setOpenUpdate(false)}
          data={packageToUpdate}
        />
      )}
    </div>
  );
};

export default PremiumPackage;
