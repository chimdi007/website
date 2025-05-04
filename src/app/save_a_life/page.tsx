"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const saveALife = () => {

  const [CurrentPage, setCurrentPage] = useState('home');   //and 'donation'
  const [shareCode, setShareCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [patientsList, setPatientsList] = useState([
    {
      name: "Aisha Bello",
      shareCodeReason: "₦1,200,000",
      credit: "₦450,000 | 37%",
      image: "/image 4.svg",
      shareCode: "123456",
      location: "Lagos, Nigeria",
    },
    {
      name: "Michael Adewale",
      shareCodeReason: "Needs ₦2,500,000 for kidney transplant",
      credit: "₦850,000 | 34%",
      image: "/image-3.svg",
      shareCode: "123456",
      location: "Lagos, Nigeria",
    },
  ]);
  const [selectedPatient, setSelectedPatient] = useState({
    name: "",
    shareCodeReason: "",
    credit: "",
    image: "",
    shareCode: "",
    location: "",
    patientEmail: "",
    donorEmail: "",
    paystackPublicKey: "",
    amount: "",
    description: "",
    reference: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSelectedPatient({ ...selectedPatient, [e.target.name]: e.target.value });
  };

  
  const handleFetchPatientsInNeed = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/web/save_a_life?shareCode=${encodeURIComponent(shareCode)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const contentType = res.headers.get("content-type");
      const raw = await res.text();

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid server response");
      }

      const patients = JSON.parse(raw);

      if (!res.ok) {
        throw new Error(patients.message || "Could not fetch patients");
      }

      setPatientsList(patients.patientsList);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Auto-fetch on first load
  useEffect(() => {
    handleFetchPatientsInNeed();
  }, []);


  
  //Payment related functions

  // Load Paystack SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);


  //Handle payment on paystack
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!(window as any).PaystackPop) {
        alert("Payment gateway not loaded. Please refresh the page.");
        return;
      }

      if (!selectedPatient.paystackPublicKey || !selectedPatient.shareCode || !selectedPatient.amount) {
        alert("Incomplete payment data. Please try again.");
        return;
      }

      const paystackAmount = parseInt(selectedPatient.amount) * 100;

      const handler = (window as any).PaystackPop.setup({
        key: selectedPatient.paystackPublicKey,
        email: selectedPatient.donorEmail,
        amount: paystackAmount,
        currency: "NGN",
        metadata: {
          shareCode: selectedPatient.shareCode,
          transactionCategory: "shareCode",
          email: selectedPatient.patientEmail,
          description: selectedPatient.description,
        },
        callback: (response: any) => {
          setSelectedPatient((prev) => ({
            ...prev,
            reference: response.reference,
          }));
          console.log("Payment complete:", response);
          alert("Payment successful!");
          setSubmitted(true);
        },
        onClose: () => {
          alert("Transaction cancelled.");
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  
  return (
    <div className="relative mt-24">
      {CurrentPage==='home' && (<div className="px-6 xl:px-[130px] py-12 space-y-16">
        
        <div className="items-center space-y-3">
          <h1 className="text-[32px] font-montserrat font-bold leading-[50px] text-[#002A40]">
            <span className="text-[#FE6F15]">PrescribeNg</span> Save A Life
            Initiative
          </h1>
          <p className="text-[16px]">
            At Prescribeng, we believe that no one should be denied healthcare
            due to financial constraints. Our Save a Life initiative is a
            crowdfunding platform where you can directly contribute to the
            medical expenses of patients in need. Every donation you make goes
            strictly toward settling healthcare bills at the point of service,
            ensuring that your generosity has an immediate and meaningful
            impact.
          </p>
          ✅ 100% of your donation goes directly to medical care – we do not
          charge any commission.
          <p>
            ✅ Funds are strictly for settling hospital bills at the point of
            service and cannot be withdrawn or transferred by the patient or
            their family.
          </p>
          <p>
            ✅ In the unfortunate event of a patient’s passing, we ensure full
            transparency by issuing the raised funds to the family via a cheque,
            upon presenting a verified death certificate.
          </p>
          <p className="text-[16px]">
            Every contribution, no matter how small, brings hope and healing to
            those who need it most.
          </p>
          <p className="text-[16px]">
            Below is a list of patients currently seeking help. Browse through
            their stories and contribute to a cause that resonates with you.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            name="email"
            placeholder="Input share code"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
          />
          <button className="w-[149px] bg-[#0077B6] text-white py-2 px-4 rounded-[10px] text-[16px]">
            Find case
          </button>
        </div>

        <div className="overflow-hidden bg-[#F5F5F5] text-[16px]">
          <div className="">
            <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory scrollbar-hide w-full">
              {patientsList.map((card, i) => (
                <div
                  key={i}
                  className="snap-start flex-shrink-0 w-[342px] md:w-[342px] bg-white rounded-[5px]"
                >
                  <Image
                    className="w-[342px] h-[187px] object-cover rounded-t-[5px]"
                    src={card.image}
                    alt={`Image of ${card.name}`}
                    width={342}
                    height={178}
                  />
                  <div className="p-4 space-y-2">
                    <p className="font-montserrat text-[16px] font-bold">
                      {card.name}
                    </p>
                    <p>
                      <span className="font-bold">Condition: </span> {card.shareCodeReason}
                    </p>
                    <p>
                      <span className="font-bold">Location: </span>
                      {card.location}
                    </p>
                    <p>
                      <span className="font-bold">Raised: </span> {card.credit}✅
                    </p>
                    <p>
                      <span className="font-bold">Share Code: </span>
                      {card.shareCode}
                    </p>
                    
                    <div className="flex gap-2 items-center" onClick={()=>{setSelectedPatient((prev) => ({
                                                                        ...prev,
                                                                        ...card,
                                                                      })); setCurrentPage('donationForm')}}>
                      <p className="text-[#0077B6] text-[16px]">Donate Now</p>
                      <Image
                        className="w-[24px] h-[24px]"
                        src="/arrow-right.svg"
                        alt="Arrow"
                        width={24}
                        height={24}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>)}


      {CurrentPage==='donationForm' && (
      <div className="md:flex md:flex-col items-center space-y-8">
      <div className="space-y-[16px] text-[#002A40] py-12">
      </div>
      <div className="bg-white space-y-6">
        <div className="space-y-[16px] text-[#002A40]">
          <h1 className="text-[32px] font-extrabold px-8 py-6 text-center leading-[50px]">
          {selectedPatient.name}
          </h1>
        </div>

        {submitted ? (
          <div className="w-full md:w-[790px] px-8 py-8 space-y-8">
            <p className="text-green-600 text-center">
              Thank you! We&apos;ll get back to you soon.
            </p>
            <button
              className="bg-[#0077B6] text-white py-2 px-4 rounded-md hover:bg-[#e35c00] transition"
              onClick={()=>{setSelectedPatient({
                name: "",
                shareCodeReason: "",
                credit: "",
                image: "",
                shareCode: "",
                location: "",
                patientEmail: "",
                donorEmail: "",
                paystackPublicKey: "",
                amount: "",
                description: "",
                reference: "",
              }); setCurrentPage('home')}}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="w-full md:w-[790px] px-8 py-8 space-y-8">
            <div
                  className="snap-start flex-shrink-0 w-[342px] md:w-[342px] bg-white rounded-[5px]"
                >
                  <Image
                    className="w-[342px] h-[187px] object-cover rounded-t-[5px]"
                    src={selectedPatient.image}
                    alt={`Image of ${selectedPatient.name}`}
                    width={342}
                    height={178}
                  />
                  <div className="p-4 space-y-2">
                    <p className="font-montserrat text-[16px] font-bold">
                      {selectedPatient.name}
                    </p>
                    <p>
                      <span className="font-bold">Condition: </span> {selectedPatient.shareCodeReason}
                    </p>
                    <p>
                      <span className="font-bold">Location: </span>
                      {selectedPatient.location}
                    </p>
                    <p>
                      <span className="font-bold">Raised: </span> {selectedPatient.credit}✅
                    </p>
                    <p>
                      <span className="font-bold">Share Code: </span>
                      {selectedPatient.shareCode}
                    </p>
                  </div>
              </div>
            

            <div>
              <label className="block text-sm font-medium text-[#002A40] mb-1">
                Email
              </label>
              <input
                type="email"
                name="donorEmail"
                placeholder="Enter your email"
                required
                value={selectedPatient.donorEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#002A40] mb-1">
                Amount (₦)
              </label>
              <input
                type="text"
                name="amount"
                placeholder="Enter the amount"
                required
                value={selectedPatient.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#002A40] mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                name="description"
                placeholder="Note or reference"
                value={selectedPatient.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#0077B6] text-white py-2 px-4 rounded-md hover:bg-[#e35c00] transition"
            >
              Donate
            </button>

            <button
              className="bg-[#0077B6] text-white py-2 px-4 rounded-md hover:bg-[#e35c00] transition"
              onClick={()=>{setSelectedPatient({
                name: "",
                shareCodeReason: "",
                credit: "",
                image: "",
                shareCode: "",
                location: "",
                patientEmail: "",
                donorEmail: "",
                paystackPublicKey: "",
                amount: "",
                description: "",
                reference: "",
              }); setCurrentPage('home')}}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>)}

      <div className="bg-[#FFF1E8] px-6 xl:px-[130px] py-12 space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <h1 className="text-[32px] font-montserrat font-bold leading-[50px] text-[#002A40]">
            Your Donation Can Save a Life!
          </h1>
          <p className="text-[16px]">
            Every contribution, big or small, brings hope to those in need. Join
            us in making a difference today!
          </p>
        </div>
        <div className="flex justify-center">
          <button className="bg-[#0077B6] text-white py-2 px-4 rounded-[10px] text-[16px]">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default saveALife;