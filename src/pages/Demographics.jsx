// src/pages/Demographics.jsx
import React, { useState, useEffect } from "react";
import { insertParticipant } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/Demographics.css";

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
  "United States of America","Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
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
  "Slovakia","Slovenia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea",
  "Spain","Sri Lanka","Sudan","Suriname","Swaziland","Sweden","Switzerland",
  "Syrian Arab Republic","Tajikistan","Thailand",
  "The former Yugoslav Republic of Macedonia","Timor-Leste","Togo","Tonga",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates",
  "United Kingdom of Great Britain and Northern Ireland",
  "United Republic of Tanzania","Uruguay","Uzbekistan",
  "Vanuatu","Venezuela, Bolivarian Republic of...","Viet Nam","Yemen","Zambia","Zimbabwe"
];

export default function Demographics() {
  const navigate = useNavigate();

  const [prolificId, setProlificId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // -------------------------
  // FORM STATE
  // -------------------------
  const [form, setForm] = useState({
    prolificIdInput: "",   // Q0
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
    writingSkill: "", // NEW: replaces writing_enjoyment
  });

  const [citizenshipSearch, setCitizenshipSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // -------------------------
  // LOAD PROLIFIC ID + SESSION
  // -------------------------
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

  // -------------------------
  // CITIZENSHIP SELECT LOGIC
  // -------------------------
  const toggleCitizenship = (country) => {
    setForm((prev) => {
      const exists = prev.citizenship.includes(country);
      return {
        ...prev,
        citizenship: exists
          ? prev.citizenship.filter((c) => c !== country)
          : [...prev.citizenship, country],
      };
    });
  };

  // -------------------------
  // VALIDATION
  // -------------------------
  const validate = () => {
    if (!form.prolificIdInput && !prolificId)
      return "Please enter your Prolific ID.";

    if (!form.age || Number(form.age) < 18)
      return "You must be at least 18 years old to participate.";

    if (!form.gender) return "Please select your gender.";
    if (form.citizenship.length === 0)
      return "Please select at least one citizenship.";
    if (!form.ethnicity) return "Please select your ethnicity.";
    if (!form.education) return "Please select your education level.";
    if (!form.englishFirst) return "Please answer the first-language question.";

    if (form.englishFirst === "No") {
      if (!form.nativeLanguage) return "Please enter your native language.";
      if (!form.ageStartEnglish) return "Please enter age you started English.";
      if (!form.yearsStudiedEnglish) return "Please enter years studied.";
      if (!form.yearsInUS) return "Please enter years in the U.S.";
    }

    if (!form.writingSkill)
      return "Please answer the writing skill question.";

    return null;
  };

  // -------------------------
  // SUBMISSION
  // -------------------------
  const handleSubmit = async () => {
    const v = validate();
    if (v) return setErrorMsg(v);

    setLoading(true);

    const prolific_id_final = form.prolificIdInput || prolificId;

    const payload = {
      prolific_id: prolific_id_final,
      session_id: sessionId,
      age: Number(form.age),
      gender: form.gender,
      citizenship: form.citizenship,
      ethnicity: form.ethnicity,
      education_level: form.education,

      english_first_language: form.englishFirst === "Yes",
      native_language:
        form.englishFirst === "No" ? form.nativeLanguage : null,
      age_start_learning_english:
        form.englishFirst === "No" ? Number(form.ageStartEnglish) : null,
      years_studied_english:
        form.englishFirst === "No" ? Number(form.yearsStudiedEnglish) : null,
      years_in_us:
        form.englishFirst === "No" ? Number(form.yearsInUS) : null,

      writing_skill: Number(form.writingSkill),

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

  // -------------------------
  // UI RENDER
  // -------------------------
  return (
    <div className="demo-page">
      <div className="demo-card">
        <h1 className="demo-title">Demographic Survey</h1>

        {errorMsg && <p className="error">{errorMsg}</p>}

        {/* Q0 */}
        <div className="q-block">
          <label>Q0: What is your Prolific ID?</label>
          <input
            type="text"
            className="demo-input"
            placeholder="Enter your Prolific ID"
            value={form.prolificIdInput}
            onChange={(e) =>
              setForm({ ...form, prolificIdInput: e.target.value })
            }
          />
        </div>

        {/* Q1 */}
        <div className="q-block">
          <label>Q1: What is your age?</label>
          <input
            type="number"
            className="demo-input"
            value={form.age}
            onChange={(e) => {
              const v = e.target.value;
              setForm({ ...form, age: v });
            }}
          />
        </div>

        {/* Q2 */}
        <div className="q-block">
          <label>Q2: What gender do you identify as?</label>
          <select
            className="demo-input"
            value={form.gender}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
          >
            <option value="">Select...</option>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary / third gender</option>
            <option>Prefer not to say</option>
          </select>
        </div>

        {/* Q3 Citizenship */}
        <div className="q-block">
          <label>
            Q3: What is your country of citizenship? (Select all that apply)
          </label>

          <details className="dropdown">
            <summary className="dropdown-summary">
              {form.citizenship.length > 0
                ? form.citizenship.join("; ")
                : "Select countries…"}
              <span className="dropdown-count">
                ({form.citizenship.length} selected)
              </span>
            </summary>

            <div className="dropdown-panel">
              <input
                type="text"
                placeholder="Search..."
                className="dropdown-search"
                value={citizenshipSearch}
                onChange={(e) => setCitizenshipSearch(e.target.value)}
              />

              <div className="dropdown-options">
                {COUNTRY_LIST.filter((c) =>
                  c.toLowerCase().includes(
                    citizenshipSearch.toLowerCase()
                  )
                ).map((country) => (
                  <label className="dropdown-option" key={country}>
                    <input
                      type="checkbox"
                      checked={form.citizenship.includes(country)}
                      onChange={() => toggleCitizenship(country)}
                    />
                    {country}
                  </label>
                ))}
              </div>

              <div className="dropdown-footer">
                <button
                  type="button"
                  onClick={() =>
                    document.querySelector(".dropdown")?.removeAttribute("open")
                  }
                >
                  Done
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Q4 Ethnicity */}
        <div className="q-block">
          <label>Q4: Which race/ethnicity best describes you?</label>
          <select
            className="demo-input"
            value={form.ethnicity}
            onChange={(e) =>
              setForm({ ...form, ethnicity: e.target.value })
            }
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
        </div>

        {/* Q5 Education */}
        <div className="q-block">
          <label>Q5: Highest degree completed</label>
          <select
            className="demo-input"
            value={form.education}
            onChange={(e) =>
              setForm({ ...form, education: e.target.value })
            }
          >
            <option value="">Select...</option>
            <option>No schooling completed</option>
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
        </div>

        {/* Q6 English First? */}
        <div className="q-block">
          <label>Q6: Is English your first language?</label>
          <div className="radio-row">
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
          </div>
        </div>

        {/* Conditional L2 Questions */}
        {form.englishFirst === "No" && (
          <>
            <div className="q-block">
              <label>What is your native language?</label>
              <input
                type="text"
                className="demo-input"
                value={form.nativeLanguage}
                onChange={(e) =>
                  setForm({ ...form, nativeLanguage: e.target.value })
                }
              />
            </div>

            <div className="q-block">
              <label>At what age did you start learning English?</label>
              <input
                type="number"
                className="demo-input"
                value={form.ageStartEnglish}
                onChange={(e) =>
                  setForm({ ...form, ageStartEnglish: e.target.value })
                }
              />
            </div>

            <div className="q-block">
              <label>How many years have you studied English?</label>
              <input
                type="number"
                step="0.1"
                className="demo-input"
                value={form.yearsStudiedEnglish}
                onChange={(e) =>
                  setForm({ ...form, yearsStudiedEnglish: e.target.value })
                }
              />
            </div>

            <div className="q-block">
              <label>How many years have you been in the U.S.?</label>
              <input
                type="number"
                step="0.1"
                className="demo-input"
                value={form.yearsInUS}
                onChange={(e) =>
                  setForm({ ...form, yearsInUS: e.target.value })
                }
              />
            </div>
          </>
        )}

        {/* Q7 Writing Skill */}
        <div className="q-block">
          <label>Q7: I am good at writing</label>
          <select
            className="demo-input"
            value={form.writingSkill}
            onChange={(e) =>
              setForm({ ...form, writingSkill: e.target.value })
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
        </div>

        {/* Submit Button */}
        <div className="button-row">
          <button
            className="demo-button"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
