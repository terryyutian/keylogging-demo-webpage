// src/pages/Demographics.jsx
import React, { useState, useEffect, useRef } from "react";
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
  "Vanuatu","Venezuela, bolivarian Republic of...","Viet Nam","Yemen","Zambia","Zimbabwe"
];

const NON_NATIVE_CONFIRM_TEXT =
  "Thank you for your interest. This study is limited to native English speakers.\n\nPlease click OK to return to Prolific and return your submission.";

const RETURNING_PARTICIPANT_ALERT_TEXT =
  "You have completed this study in previous batches according to our record.\n\nPlease click OK to return to Prolific and return your submission.";

const PROLIFIC_RETURN_URL = "https://app.prolific.com/";

// Returning participants (normalize to lowercase for comparison)
const RETURNING_PROLIFIC_IDS = new Set([
  "697cdd4e32e3ba796d6bf8e2",
  "6109afc6254bff5fc0c0d87c",
  "657484ce078a676a635baf39",
  "695bfaac39d75f3dd960b53f",
  "69828b18907aeaa72e1f3e7d",
  "696045a3e464213c52ceb0bd",
  "5cb882d33f0af9000159e00f",
  "667c66be2cfdb420fd63f2c9",
  "6429ffe11a9806a9a95ad072",
  "6938b3a102d6dfae6c72a140",
  "662948ed99960b11f2f8e3fe",
  "5e14ffee6f6c63b33cf77eb3",
  "631c8e97db06f601f81bd82f",
  "67eda7cef014b05ef5504c28",
  "66491e9882aaa64c5d0911d5",
  "6952b9a83256edcc4b11ebee",
  "6978d78491ea9e2fdea1c5f0",
  "695ff8839a2ca7f0e6a87f05",
  "5e3adfc595ff562fbdd130fa",
  "6792c21092dba48f9c45aab7",
  "6772a5c5190112e5dcbf6394",
  "5d55d562e04e1c0001f5e682",
  "5fd66ce8aec66457ff73d743",
]);

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
    writingSkill: "",
  });

  const [citizenshipSearch, setCitizenshipSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prevent double-alert/redirect (e.g., React StrictMode double-invokes effects in dev)
  const hasRunReturningCheckRef = useRef(false);

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
  // SCREEN: returning participant by Prolific ID → ALERT → REDIRECT
  // -------------------------
  useEffect(() => {
    if (hasRunReturningCheckRef.current) return;
    if (!prolificId) return;

    hasRunReturningCheckRef.current = true;

    const pidNorm = String(prolificId).trim().toLowerCase();
    if (RETURNING_PROLIFIC_IDS.has(pidNorm)) {
      // OK-only dialog
      window.alert(RETURNING_PARTICIPANT_ALERT_TEXT);
      window.location.assign(PROLIFIC_RETURN_URL);
    }
  }, [prolificId]);

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
    // Prolific ID must come from URL now
    if (!prolificId)
      return "Missing Prolific ID in the study link. Please return to Prolific and relaunch the study.";

    // (Fail-safe) Block returning participants even if they bypass UI
    const pidNorm = String(prolificId).trim().toLowerCase();
    if (RETURNING_PROLIFIC_IDS.has(pidNorm))
      return "This Prolific ID has already completed the study.";

    if (!form.age || Number(form.age) < 18)
      return "You must be at least 18 years old to participate.";

    if (!form.gender) return "Please select your gender.";
    if (form.citizenship.length === 0)
      return "Please select at least one citizenship.";
    if (!form.ethnicity) return "Please select your ethnicity.";
    if (!form.education) return "Please select your education level.";
    if (!form.englishFirst) return "Please answer the first-language question.";

    // still block submission (in case someone bypasses the UI)
    if (form.englishFirst === "No")
      return "This study is limited to native English speakers.";

    if (!form.writingSkill) return "Please answer the writing skill question.";

    return null;
  };

  // -------------------------
  // SCREEN: Q6 ("No") CONFIRM → REDIRECT TO PROLIFIC
  // -------------------------
  const handleEnglishFirstChange = (value) => {
    setForm((prev) => ({ ...prev, englishFirst: value }));

    if (value === "No") {
      const ok = window.confirm(NON_NATIVE_CONFIRM_TEXT);

      if (ok) {
        window.location.assign(PROLIFIC_RETURN_URL);
        return;
      } else {
        setForm((prev) => ({ ...prev, englishFirst: "" }));
      }
    }
  };

  // -------------------------
  // SUBMISSION
  // -------------------------
  const handleSubmit = async () => {
    const v = validate();
    if (v) return setErrorMsg(v);

    setLoading(true);

    const payload = {
      prolific_id: prolificId,
      session_id: sessionId,
      age: Number(form.age),
      gender: form.gender,
      citizenship: form.citizenship,
      ethnicity: form.ethnicity,
      education_level: form.education,

      // guaranteed true by validation
      english_first_language: true,

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

        {/* Q1 */}
        <div className="q-block">
          <label>Q1: What is your age?</label>
          <input
            type="number"
            className="demo-input"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </div>

        {/* Q2 */}
        <div className="q-block">
          <label>Q2: What gender do you identify as?</label>
          <select
            className="demo-input"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
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
                  c.toLowerCase().includes(citizenshipSearch.toLowerCase())
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
        </div>

        {/* Q5 Education */}
        <div className="q-block">
          <label>Q5: Highest degree completed</label>
          <select
            className="demo-input"
            value={form.education}
            onChange={(e) => setForm({ ...form, education: e.target.value })}
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
                onChange={(e) => handleEnglishFirstChange(e.target.value)}
              />
              Yes
            </label>

            <label>
              <input
                type="radio"
                name="englishFirst"
                value="No"
                checked={form.englishFirst === "No"}
                onChange={(e) => handleEnglishFirstChange(e.target.value)}
              />
              No
            </label>
          </div>
        </div>

        {/* Q7 Writing Skill */}
        <div className="q-block">
          <label>Q7: I am good at writing</label>
          <select
            className="demo-input"
            value={form.writingSkill}
            onChange={(e) => setForm({ ...form, writingSkill: e.target.value })}
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
