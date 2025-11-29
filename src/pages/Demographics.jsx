import React, { useState, useEffect } from "react";
import { insertParticipant } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function getProlificIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("participant_id") ||
    params.get("PROLIFIC_PID") ||
    params.get("prolific_pid") ||
    null
  );
}

const COUNTRY_LIST = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
  "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
  "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei Darussalam",
  "Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada",
  "Cape Verde","Central African Republic","Chad","Chile","China","Colombia",
  "Comoros","Congo, Republic of the...","Costa Rica","Côte d'Ivoire","Croatia",
  "Cuba","Cyprus","Czech Republic","Democratic Republic of the Congo","Denmark",
  "Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador",
  "Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala",
  "Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hong Kong (S.A.R.)",
  "Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait",
  "Kyrgyzstan","Lao People's Democratic Republic","Latvia","Lebanon","Lesotho",
  "Liberia","Libyan Arab Jamahiriya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands",
  "Mauritania","Mauritius","Mexico","Micronesia, Federated States of...","Monaco",
  "Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru",
  "Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea",
  "Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru",
  "Philippines","Poland","Portugal","Qatar","Republic of Moldova","Romania",
  "Russian Federation","Rwanda","Saint Kitts and Nevis","Saint Lucia",
  "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
  "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea",
  "Spain","Sri Lanka","Sudan","Suriname","Swaziland","Sweden","Switzerland",
  "Syrian Arab Republic","Tajikistan","Thailand",
  "The former Yugoslav Republic of Macedonia","Timor-Leste","Togo","Tonga",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates",
  "United Kingdom of Great Britain and Northern Ireland",
  "United Republic of Tanzania","United States of America","Uruguay","Uzbekistan",
  "Vanuatu","Venezuela, Bolivarian Republic of...","Viet Nam","Yemen","Zambia","Zimbabwe"
];

export default function Demographics() {
  const navigate = useNavigate();

  const [prolificId, setProlificId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const [form, setForm] = useState({
    age: "",
    gender: "",
    citizenship: [],
    ethnicity: "",
    education: "",
    englishFirst: "",
    nativeLanguage: "",
    ageStartEnglish: "",
    yearsStudiedEnglish: "",
    yearsInUS: "",
    writingEnjoyment: "",
  });

  const [searchCountry, setSearchCountry] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load Prolific ID + generate session ID
  useEffect(() => {
    const pid = getProlificIdFromUrl();
    setProlificId(pid);

    let sid = sessionStorage.getItem("session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("session_id", sid);
    }
    setSessionId(sid);
  }, []);

  const toggleCitizenship = (c) => {
    setForm((prev) => {
      const exists = prev.citizenship.includes(c);
      return {
        ...prev,
        citizenship: exists
          ? prev.citizenship.filter((x) => x !== c)
          : [...prev.citizenship, c],
      };
    });
  };

  const validate = () => {
    if (!form.age || Number(form.age) < 18) {
      return "You must be at least 18 years old.";
    }
    if (!form.gender) return "Please select your gender.";
    if (form.citizenship.length === 0)
      return "Please select at least one citizenship.";
    if (!form.ethnicity) return "Please select your ethnicity.";
    if (!form.education) return "Please select your education level.";
    if (!form.englishFirst) return "Please answer whether English is your first language.";
    if (form.englishFirst === "No") {
      if (!form.nativeLanguage) return "Please enter your native language.";
      if (!form.ageStartEnglish) return "Please enter the age you started learning English.";
      if (!form.yearsStudiedEnglish) return "Please enter years studied.";
      if (!form.yearsInUS) return "Please enter years in the U.S.";
    }
    if (!form.writingEnjoyment)
      return "Please answer the writing enjoyment question.";
    return null;
  };

  const submitForm = async () => {
    const error = validate();
    if (error) {
      setErrorMsg(error);
      return;
    }

    setLoading(true);

    const payload = {
      prolific_id: prolificId,
      session_id: sessionId,

      age: Number(form.age),
      gender: form.gender,
      citizenship: form.citizenship,
      ethnicity: form.ethnicity,
      education_level: form.education,
      english_first_language: form.englishFirst === "Yes",

      native_language: form.englishFirst === "No" ? form.nativeLanguage : null,
      age_start_learning_english:
        form.englishFirst === "No" ? Number(form.ageStartEnglish) : null,
      years_studied_english:
        form.englishFirst === "No" ? Number(form.yearsStudiedEnglish) : null,
      years_in_us:
        form.englishFirst === "No" ? Number(form.yearsInUS) : null,

      writing_enjoyment: Number(form.writingEnjoyment),

      consent_timestamp: new Date().toISOString(),
    };

    const { data, error: supabaseError } = await insertParticipant(payload);

    if (supabaseError) {
      setErrorMsg(supabaseError.message);
      setLoading(false);
      return;
    }

    sessionStorage.setItem("participant_id", data.id);

    setLoading(false);
    navigate("/vocab");
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>Demographic Survey</h2>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {/* Q1 Age */}
      <h3>Q1: What is your age?</h3>
      <input
        type="number"
        value={form.age}
        min="18"
        onChange={(e) => setForm({ ...form, age: e.target.value })}
      />

      {/* Q2 Gender */}
      <h3>Q2: What gender do you identify as?</h3>
      <select
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
      >
        <option value="">Select...</option>
        <option>Male</option>
        <option>Female</option>
        <option>Non-binary / third gender</option>
        <option>Prefer not to say</option>
      </select>

      {/* Q3 Citizenship */}
      <h3>Q3: What is your country of citizenship? (Select all that apply)</h3>

      <input
        type="text"
        placeholder="Search..."
        value={searchCountry}
        onChange={(e) => setSearchCountry(e.target.value)}
      />

      <div
        style={{
          maxHeight: 200,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginTop: 10,
        }}
      >
        {COUNTRY_LIST.filter((c) =>
          c.toLowerCase().includes(searchCountry.toLowerCase())
        ).map((c) => (
          <label key={c} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={form.citizenship.includes(c)}
              onChange={() => toggleCitizenship(c)}
            />
            {c}
          </label>
        ))}
      </div>

      {/* Q4 Ethnicity */}
      <h3>Q4: Which race/ethnicity best describes you?</h3>
      <select
        value={form.ethnicity}
        onChange={(e) => setForm({ ...form, ethnicity: e.target.value })}
      >
        <option value="">Select...</option>
        <option>American Indian or Alaska Native</option>
        <option>Asian</option>
        <option>Black or African American</option>
        <option>Hispanic or Latino</option>
        <option>Native Hawaiian or Pacific Islander</option>
        <option>White</option>
        <option>Multiple ethnicity / Other</option>
      </select>

      {/* Q5 Education */}
      <h3>Q5: Highest degree completed</h3>
      <select
        value={form.education}
        onChange={(e) => setForm({ ...form, education: e.target.value })}
      >
        <option value="">Select...</option>
        <option>No schooling completed</option>
        <option>Nursery school to 8th grade</option>
        <option>Some high school, no diploma</option>
        <option>High school graduate</option>
        <option>Some college credit, no degree</option>
        <option>Trade/technical/vocational training</option>
        <option>Associate degree</option>
        <option>Bachelor’s degree</option>
        <option>Master’s degree</option>
        <option>Professional degree</option>
        <option>Doctorate degree</option>
      </select>

      {/* Q6 English first language */}
      <h3>Q6: Is English your first language?</h3>
      <label>
        <input
          type="radio"
          name="englishFirst"
          value="Yes"
          checked={form.englishFirst === "Yes"}
          onChange={(e) =>
            setForm({ ...form, englishFirst: e.target.value })
          }
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="englishFirst"
          value="No"
          checked={form.englishFirst === "No"}
          onChange={(e) =>
            setForm({ ...form, englishFirst: e.target.value })
          }
        />
        No
      </label>

      {/* Q7–Q10 only if No */}
      {form.englishFirst === "No" && (
        <div style={{ marginTop: 20 }}>
          <h3>Q7: What is your native language?</h3>
          <input
            type="text"
            value={form.nativeLanguage}
            onChange={(e) =>
              setForm({ ...form, nativeLanguage: e.target.value })
            }
          />

          <h3>Q8: At what age did you start learning English?</h3>
          <input
            type="number"
            value={form.ageStartEnglish}
            onChange={(e) =>
              setForm({ ...form, ageStartEnglish: e.target.value })
            }
          />

          <h3>Q9: How many years have you studied English?</h3>
          <input
            type="number"
            step="0.1"
            value={form.yearsStudiedEnglish}
            onChange={(e) =>
              setForm({ ...form, yearsStudiedEnglish: e.target.value })
            }
          />

          <h3>Q10: How many years have you been in the U.S.?</h3>
          <input
            type="number"
            step="0.1"
            value={form.yearsInUS}
            onChange={(e) =>
              setForm({ ...form, yearsInUS: e.target.value })
            }
          />
        </div>
      )}

      {/* Q11 Writing Enjoyment */}
      <h3>Q11: I enjoy writing</h3>
      <select
        value={form.writingEnjoyment}
        onChange={(e) =>
          setForm({ ...form, writingEnjoyment: e.target.value })
        }
      >
        <option value="">Select...</option>
        <option value="1">1 - Strongly Disagree</option>
        <option value="2">2 - Disagree</option>
        <option value="3">3 - Somewhat Disagree</option>
        <option value="4">4 - Somewhat Agree</option>
        <option value="5">5 - Agree</option>
        <option value="6">6 - Strongly Agree</option>
      </select>

      <br /><br />

      <button disabled={loading} onClick={submitForm}>
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
