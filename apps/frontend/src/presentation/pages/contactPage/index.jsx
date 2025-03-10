import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { RiSendPlane2Fill } from "react-icons/ri";
import { useAuthState } from "../../../logic/context/auth-context";
import { postContactUs } from "../../../data/api/contact-us";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "../../components/ui/spinner";

const ContactUsPage = () => {
  const { user } = useAuthState();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const { isPending: isSubmittingQuery, mutate: submitQuery } = useMutation({
    mutationFn: postContactUs,
    retry: false,
    onSuccess: () =>
      displaySuccess("Query submitted. We will reach out to you shortly."),
    onError: (error) => displayError(error),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitQuery(formData);
  };

  return (
    <div className="h-full flex flex-col justify-center items-center bg-slate-50 p-6">
      <div className="w-full max-w-lg bg-white rounded p-8 space-y-6 border border-slate-200">
        <h3 className="text-3xl font-semibold text-slate-800">Contact Us</h3>
        <p className="text-slate-500">
          We'd love to hear from you. Please send us your query and we'll get
          back to you shortly.
        </p>

        <div className="flex flex-col space-y-4">
          {/* Contact Info */}
          <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-blue-500 text-lg" />
              <span className="text-slate-700">support@jetforms.live</span>
            </div>
          </div>

          {/* Contact Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-slate-700"
              >
                Message
              </label>
              <textarea
                name="message"
                id="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {isSubmittingQuery ? (
              <div className="flex justify-center items-center">
                <Spinner />
              </div>
            ) : (
              <button
                type="submit"
                className="w-full flex items-center justify-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <span>Send Message</span>
                <RiSendPlane2Fill className="ml-2 text-lg" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
