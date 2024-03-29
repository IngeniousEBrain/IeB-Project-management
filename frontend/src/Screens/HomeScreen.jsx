import React from "react";
import { Link } from "react-router-dom";

const HomeScreen = () => {
  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-4 pt-6">
          {/* <div className="flex justify-between"> */}
            <h1 className="text-3xl font-bold font-sans tracking-normal text-gray-900 pb-2">
              Dashboard
            </h1>
            <Link to="/create-project">
              <button className="p-2 rounded-md font-medium bg-indigo-600 text-white">
                Request for Proposal
              </button>
            </Link>
          {/* </div> */}
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
