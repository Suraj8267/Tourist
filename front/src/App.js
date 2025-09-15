import React, { useState , useEffect } from "react";
import "./App.css";
import { AiOutlineEye } from "react-icons/ai";
import { User, Phone, IdCard,MapPin, Calendar, Home, Globe, CreditCard, UserCheck } from "lucide-react";








function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Saathi</div>
      <div className="status-bar">
  <span className="lang"><span className="icon-green-dot"></span>  EN </span>
  <span className="enc"><span className="lock"></span>| Encrypted </span>
  <span className="active"><span className="active"></span>| System Active</span>
</div>


    </nav>
  );
}


function ProgressBar({ step }) {
  return (
    <div className="progress-bar">
      <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
      <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
      <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
    </div>
  );
}


function Step1Personal({ formData, setFormData, handleNext }) {
 
  // This hook automatically changes the ID Type when Nationality changes
  useEffect(() => {
    if (formData.nationality === 'Indian') {
      setFormData(prevData => ({ ...prevData, id_type: 'Aadhaar' }));
    } else if (formData.nationality === 'Foreigner') {
      setFormData(prevData => ({ ...prevData, id_type: 'Passport' }));
    }
  }, [formData.nationality, setFormData]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  return (
<div className="form-card min-h-screen bg-grid-pattern">
  <h2>Personal Information</h2>
  <div className="form-grid">
   
    {/* Full Name */}
    <div className="form-group">
      <label htmlFor="fullName" className="form-label">
        <User className="icon" size={18} style={{ color:"blue"}}/> Full Name
      </label>
      <input
        id="fullName"
        type="text"
        name="fullName"
        placeholder="Enter your full name"
        value={formData.fullName}
        onChange={handleChange}
        aria-required="true"
      />
    </div>




    {/* Nationality */}
    <div className="form-group">
      <label htmlFor="nationality" className="form-label">
        <Globe className="icon text-blue-500" size={18} style={{ color:"blue"}}/> Nationality
      </label>
      <select
        id="nationality"
        name="nationality"
        value={formData.nationality}
        onChange={handleChange}
      >
        <option value="Indian">Indian</option>
        <option value="Foreigner">Foreigner</option>
      </select>
    </div>




    {/* ID Type (Auto-Set) */}
    <div className="form-group">
      <label htmlFor="id_type" className="form-label">
        <IdCard className="icon text-indigo-500" size={18} style={{ color:"red"}}/> ID Type
      </label>
      <input
        type="text"
        id="id_type"
        name="id_type"
        value={formData.nationality === "Indian" ? "Aadhaar" : "Passport"}
        disabled
      />
    </div>




    {/* ID Number */}
    <div className="form-group">
      <label htmlFor="id_number" className="form-label">
        <IdCard className="icon text-indigo-500" size={18} style={{ color:"magenta"}}/> ID Number
      </label>
      <input
        id="id_number"
        type="text"
        name="id_number"
        placeholder="Enter ID Number"
        value={formData.id_number}
        onChange={handleChange}
      />
    </div>




    {/* Phone Number */}
    <div className="form-group">
      <label htmlFor="phone" className="form-label">
        <Phone className="icon text-green-500" size={18} style={{ color:"green"}} /> Phone Number
      </label>
      <input
        id="phone"
        type="tel"
        name="phone"
        placeholder="+91 XXXXX XXXXX"
        value={formData.phone}
        onChange={handleChange}
        aria-required="true"
      />
    </div>




    {/* Emergency Contact Name */}
    <div className="form-group">
      <label htmlFor="emergency_contact_name" className="form-label">
        <User className="icon text-red-500" size={18} style={{ color:"blue"}}/> Emergency Contact Name
      </label>
      <input
        id="emergency_contact_name"
        type="text"
        name="emergency_contact_name"
        placeholder="Emergency contact name"
        value={formData.emergency_contact_name}
        onChange={handleChange}
      />
    </div>




    {/* Emergency Contact Phone */}
    <div className="form-group">
      <label htmlFor="emergency_contact_phone" className="form-label">
        <Phone className="icon text-purple-500" size={18} style={{ color:"light-green"}}/> Emergency Contact Phone
      </label>
      <input
        id="emergency_contact_phone"
        type="tel"
        name="emergency_contact_phone"
        placeholder="Emergency contact number"
        value={formData.emergency_contact_phone}
        onChange={handleChange}
        aria-required="true"
      />
    </div>




    {/* Destination */}
    <div className="form-group">
      <label htmlFor="destination" className="form-label">
        <MapPin className="icon text-green-500" size={18} style={{ color:"brown"}}/> Destination
      </label>
      <input
        id="destination"
        type="text"
        name="destination"
        placeholder="Primary destination"
        value={formData.destination}
        onChange={handleChange}
        aria-required="true"
      />
    </div>




    {/* Check-in Date */}
    <div className="form-group">
      <label htmlFor="checkin_date" className="form-label">
        <Calendar className="icon text-blue-500" size={18} style={{ color:"magenta"}}/> Check-in Date
      </label>
      <input
        id="checkin_date"
        type="date"
        name="checkin_date"
        value={formData.checkin_date}
        onChange={handleChange}
        aria-required="true"
      />
    </div>




    {/* Check-out Date */}
    <div className="form-group">
      <label htmlFor="checkout_date" className="form-label">
        <Calendar className="icon text-indigo-500" size={18} style={{ color:"green"}} />  Check-out Date
      </label>
      <input
        id="checkout_date"
        type="date"
        name="checkout_date"
        value={formData.checkout_date}
        onChange={handleChange}
        aria-required="true"
      />
    </div>




    {/* Accommodation */}
    <div className="form-group full-width">
      <label htmlFor="accommodation" className="form-label">
        <MapPin className="icon text-purple-500" size={18} style={{ color:"blue"}}/>  Accommodation
      </label>
      <input
        id="accommodation"
        type="text"
        name="accommodation"
        placeholder="Hotel/Resort name and address"
        value={formData.accommodation}
        onChange={handleChange}
      />
    </div>
  </div>




  {/* Next button */}
  <div className="form-actions">
    <button
      type="button"
      className="btn-next"
      onClick={handleNext}
      aria-label="Proceed to next step"
    >
      Next →
    </button>
  </div>
</div>
  );
}




function Step2Documents({ nationality, docs, handleFileUpload, consent, setConsent, isLoading, registerTourist, handleBack }) {
 
  // Define required documents based on nationality
  const requiredDocs = nationality === 'Indian'
    ? ['Aadhaar Card']
    : ['Passport', 'Visa', 'Flight Ticket Confirmation'];


  return (
    <div className="form-card min-h-screen bg-upload-pattern">
      <h2>Upload Documents</h2>
      <div className="document-requirements">
        <h4>Please upload the following documents:</h4>
        <ul>
          {requiredDocs.map(doc => <li key={doc}>{doc}</li>)}
        </ul>
        {nationality === 'Foreigner' }
      </div>


      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        accept="image/jpeg,image/png,application/pdf"
        aria-label="Upload documents"
      />
     
    <ul className="uploaded-files-list">
  {docs.map((d, i) => (
    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {d.name}
      <AiOutlineEye
        size={22}
        title="Preview"
        style={{ cursor: "pointer", color: "#3366cc" }}
        onClick={() => {
          const url = URL.createObjectURL(d);
          window.open(url, "_blank");
        }}
        />
        </li>
        ))}
        </ul>


     
      <div className="consent">
        <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-label="Consent to data storage" />
        <label htmlFor="consent">I consent to my data being securely stored for issuing a temporary tourist ID.</label>
      </div>
     
      <div className="form-actions">
        <button type="button" className="btn-back" onClick={handleBack} aria-label="Go back to previous step">← Back</button>
        <button type="button" className="btn-next"  /* add this here for unique modern style */
          disabled={!consent || isLoading}
          onClick={registerTourist}
          aria-label="Generate tourist ID">
          {isLoading ? 'Registering...' : 'Register Tourist'}
        </button>


      </div>
      </div>


  );
}


function Step3Confirmation({ qrData, touristId, formData, handleReset }) {
  return (
    <div className="form-card">
      <h2>Tourist ID Generated</h2>
      <p>Scan this QR to download the app and access your ID.</p>
      <div className="qr-box">
        <img src={qrData} alt="QR Code" style={{ width: '200px', height: '200px' }} />
      </div>
      <div className="preview">
        <h3>ID Slip</h3>
        <p><b>Tourist ID:</b> {touristId}</p>
        <p><b>Name:</b> {formData.fullName}</p>
        <p><b>ID Type:</b> {formData.id_type}</p>
        <p><b>ID Number:</b> {formData.id_number}</p>
        <p><b>Trip:</b> {formData.checkin_date} → {formData.checkout_date}</p>
        <p><b>Emergency:</b> {formData.emergency_contact_phone}</p>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-next" onClick={handleReset} aria-label="Start new registration">Register New User</button>
      </div>
    </div>
  );
}




function App() {
  const initialFormData = {
    fullName: "",
    nationality: "Indian",
    id_type: "Aadhaar",
    id_number: "",
    phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    destination: "",
    checkin_date: "",
    checkout_date: "",
    accommodation: "",
  };


  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [docs, setDocs] = useState([]);
  const [consent, setConsent] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [touristId, setTouristId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  // Validation for Step 1
  const validateStep1 = () => {
    const requiredFields = [
      "fullName",
      "phone",
      "emergency_contact_phone",
      "destination",
      "checkin_date",
      "checkout_date",
    ];
    return requiredFields.every((field) => formData[field].trim() !== "");
  };


  // File upload logic
  const handleFileUpload = (e) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const files = Array.from(e.target.files).filter(
      (file) => allowedTypes.includes(file.type) && file.size <= maxSize
    );
    if (files.length < e.target.files.length) {
      alert("Only JPEG, PNG, or PDF files up to 5MB are allowed.");
    }
    setDocs([...docs, ...files]);
  };


  // Register tourist with backend
  const registerTourist = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) =>
        formDataToSend.append(key, formData[key])
      );
      docs.forEach((doc) => formDataToSend.append("documents", doc));


      const response = await fetch("http://localhost:8000/register-tourist/", {
        method: "POST",
        body: formDataToSend,
      });


      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }


      const data = await response.json();
      setTouristId(data.tourist_id);
      setQrData(data.qr_code_data);
      handleNext(); // Move to the confirmation step
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  // Navigation handlers
  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      alert("Please fill all required fields.");
      return;
    }
    setStep((prev) => prev + 1);
  };


  const handleBack = () => setStep((prev) => prev - 1);


  // Reset form handler
  const handleReset = () => {
    setFormData(initialFormData);
    setDocs([]);
    setConsent(false);
    setQrData(null);
    setTouristId(null);
    setIsLoading(false);
    setStep(1);
  };


  return (
   <div className="app-container">
    {/* Background Shapes */}
    <div className="background-shapes">
      <span className="shape circle blue"></span>
      <span className="shape square pink"></span>
      <span className="shape circle purple"></span>
      <span className="shape square cyan"></span>
      {/* Large Circle */}
<div className="shape circle large-circle"></div>


{/* Large Square */}
<div className="shape square large-square"></div>


    </div>


   
      <Navbar />
      <div className="form-container">
        <ProgressBar step={step} />


        {step === 1 && (
          <Step1Personal
            formData={formData}
            setFormData={setFormData}
            handleNext={handleNext}
          />
        )}


        {step === 2 && (
          <Step2Documents
            nationality={formData.nationality}
            docs={docs}
            handleFileUpload={handleFileUpload}
            consent={consent}
            setConsent={setConsent}
            isLoading={isLoading}
            registerTourist={registerTourist}
            handleBack={handleBack}
          />
        )}


        {step === 3 && qrData && (
          <Step3Confirmation
            qrData={qrData}
            touristId={touristId}
            formData={formData}
            handleReset={handleReset}
          />
        )}
      </div>
      <Footer />
    </div>
  );
 
}






function Footer() {
  return (
    <footer className="footer">
      <p>© 2025 Government of India - Saathi Tourism Portal</p>
      <div>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/contact">Contact Us</a>
      </div>
    </footer>
  );
}




export default App;
