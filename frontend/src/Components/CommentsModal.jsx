import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import {
  useAddCommentMutation,
  useGetCommentsByProjectIdQuery,
} from "../slices/projectApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import { useRefetchQueries } from '@reduxjs/toolkit';

const CommentsModal = ({ id, overlayOpen, closeOverlay }) => {
  const [newComment, setNewComment] = useState("");
  const [addComment, isLoading] = useAddCommentMutation();
  const { data: allcomments, isLoading: Fetching } =
    useGetCommentsByProjectIdQuery(id);

  console.log(allcomments);
  const navigate = useNavigate();
  useEffect(() => {}, [allcomments]);

  const submitComment = async (e) => {
    e.preventDefault();
    console.log(id);
    try {
      const formData = new FormData();
      formData.append("comment", newComment);
      const res = await addComment({ data: formData, id: id }).unwrap();
      console.log(res);
      if (res.msg) {
        toast.success("Comment added successfully");
      }
    } catch (err) {
      toast.error(err.error);
    }
  };

  return (
    <>
      <Transition appear show={true} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => closeOverlay()}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 border-b border-gray-900 pb-2"
                  >
                    Comments
                  </Dialog.Title>
                  <form
                    className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6"
                    onSubmit={submitComment}
                  >
                    <div className="col-span-full">
                      <label
                        htmlFor="status"
                        className="block text-md font-medium text-gray-700"
                      >
                        Write Comment
                      </label>
                      <div className="mt-2">
                        <textarea
                          type="text"
                          name="comment"
                          id="comment"
                          autoComplete="off"
                          onChange={(e) => setNewComment(e.target.value)}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="mt-2 col-span-2">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        // onClick={() => closeOverlay()}
                      >
                        Add Comment
                      </button>
                    </div>
                  </form>

                  {allcomments?.comments.length > 0 && (
                    <div className="mt-4">
                      <h1 className="block text-md font-medium text-gray-700 border-b-2 border-gray-400">
                        Previous Comments
                      </h1>
                      {allcomments?.comments.map((comment, index) => (
                        <div className="my-4" key={index}>
                          <div className="flex justify-between">
                            <p className="font-semibold text-md text-gray-600">
                              {comment.created_by.first_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {comment.created_at}
                            </p>
                          </div>
                          <div>
                            <p>{comment.comment}</p>
                            {comment.document && <p>Attached File</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default CommentsModal;
