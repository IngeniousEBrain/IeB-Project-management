import React, { useState } from "react";
import { useGetClientRevenueQuery } from "../slices/projectApiSlice";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../Components/Loading";
import { useSelector } from "react-redux";
import { FaRegCopy } from "react-icons/fa6";
import discount from "../images/discount.svg";
import { toast } from "react-toastify";

const CashbackScreen = () => {
  const [open, setOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);

  const { data, isLoading, error } = useGetClientRevenueQuery(userInfo.email);

  const navigate = useNavigate();

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="">
          <h1 className="p-4 text-white text-center text-2xl bg-yellow-600 font-bold">
            Grab Exciting Offers!
          </h1>

          <div className="my-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 text-white">
            {userInfo.yearly_discount > 0 && userInfo.yearly_amount > 0 && (
              <div className="col-span-full flex justify-between items-center gap-2 p-4 bg-cyan-500 border rounded-md">
                <div className="flex-1 flex flex-col gap-2">
                  <h3 className="text-lg">Grab upto</h3>
                  <p className="text-5xl py-2 font-bold">
                    {userInfo.yearly_discount}% Discount
                  </p>
                  <p className="text-lg">
                    on {userInfo.yearly_amount}{" "}
                    {userInfo.cashback_currency.toUpperCase()} <br /> Yearly
                    Outsourced Amount
                  </p>

                  <div className="flex gap-2">
                    <div>
                      <button
                        type="button"
                        className="w-full flex justify-between items-center gap-2 text-white font-semibold mr-5 bg-gray-700 border border-gray-700 rounded-md"
                      >
                        <div className="p-2">
                          Y{userInfo.first_name.toUpperCase()}
                          {userInfo.yearly_discount}
                        </div>
                        <button
                          type="button"
                          className="p-1 h-full mr-1 hover:rounded-md hover:bg-gray-500 hover:border-gray-500"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `Y${userInfo.first_name.toUpperCase()}${
                                userInfo.yearly_discount
                              }`
                            );
                            toast("Copied", { autoClose: 1000 });
                          }}
                        >
                          <FaRegCopy className="h-6 w-6" />
                        </button>
                      </button>
                    </div>

                    <Link to="/client/create-project">
                      <button
                        type="button"
                        className="text-black font-bold p-2 bg-white border rounded-md"
                      >
                        Redeem Offer
                      </button>
                    </Link>
                  </div>
                </div>
                <img src={discount} className="h-full w-1/2" />
              </div>
            )}

            {userInfo.quarterly_discount > 0 &&
              userInfo.quarterly_amount > 0 && (
                <div className="col-span-full flex justify-between items-center gap-2 p-4 bg-cyan-500 border rounded-md">
                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="text-lg">Grab upto</h3>
                    <p className="text-5xl py-2 font-bold">
                      {userInfo.quarterly_discount}% Discount
                    </p>
                    <p className="text-lg">
                      on {userInfo.quarterly_amount}
                      {userInfo.cashback_currency.toUpperCase()} <br /> Quarterly
                      Outsourced Amount
                    </p>

                    <div className="flex gap-2">
                      <div>
                        <button
                          type="button"
                          className="w-full flex justify-between items-center gap-2 text-white font-semibold mr-5 bg-gray-300 border border-gray-300 rounded-md"
                        >
                          <div className="p-2">
                            Q{userInfo.first_name.toUpperCase()}
                            {userInfo.quarterly_discount}
                          </div>
                          <button
                            type="button"
                            className="p-1 h-full mr-1 hover:rounded-md hover:bg-gray-400 hover:border-gray-400"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `Q${userInfo.first_name.toUpperCase()}${
                                  userInfo.quarterly_discount
                                }`
                              );
                              toast("Copied", { autoClose: 1000 });
                            }}
                          >
                            <FaRegCopy className="h-6 w-6" />
                          </button>
                        </button>
                      </div>

                      <Link to="/client/create-project">
                        <button
                          type="button"
                          className="text-black font-bold p-2 bg-white border rounded-md"
                        >
                          Redeem Offer
                        </button>
                      </Link>
                    </div>
                  </div>
                  <img src={discount} className="h-full w-1/2" />
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
};

export default CashbackScreen;
