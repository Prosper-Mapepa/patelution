"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRegister } from "@/lib/api";

type Step = 1 | 2 | 3 | 4 | 5;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepFromQuery = Number(searchParams.get("step") ?? "1");
  const initialStep: Step =
    stepFromQuery >= 1 && stepFromQuery <= 5 ? (stepFromQuery as Step) : 1;
  const months = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    [],
  );
  const days = useMemo(() => Array.from({ length: 31 }, (_, index) => index + 1), []);
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const start = 1900;
    const values: number[] = [];
    for (let year = current; year >= start; year -= 1) {
      values.push(year);
    }
    return values;
  }, []);
  const countries = useMemo(
    () => [
      "Afghanistan",
      "Albania",
      "Algeria",
      "Andorra",
      "Angola",
      "Argentina",
      "Armenia",
      "Australia",
      "Austria",
      "Azerbaijan",
      "Bahamas",
      "Bahrain",
      "Bangladesh",
      "Belarus",
      "Belgium",
      "Belize",
      "Benin",
      "Bhutan",
      "Bolivia",
      "Bosnia and Herzegovina",
      "Botswana",
      "Brazil",
      "Brunei",
      "Bulgaria",
      "Burkina Faso",
      "Burundi",
      "Cambodia",
      "Cameroon",
      "Canada",
      "Cape Verde",
      "Central African Republic",
      "Chad",
      "Chile",
      "China",
      "Colombia",
      "Comoros",
      "Costa Rica",
      "Croatia",
      "Cuba",
      "Cyprus",
      "Czech Republic",
      "Democratic Republic of the Congo",
      "Denmark",
      "Djibouti",
      "Dominican Republic",
      "Ecuador",
      "Egypt",
      "El Salvador",
      "Estonia",
      "Ethiopia",
      "Fiji",
      "Finland",
      "France",
      "Gabon",
      "Gambia",
      "Georgia",
      "Germany",
      "Ghana",
      "Greece",
      "Guatemala",
      "Guinea",
      "Guyana",
      "Haiti",
      "Honduras",
      "Hungary",
      "Iceland",
      "India",
      "Indonesia",
      "Iran",
      "Iraq",
      "Ireland",
      "Israel",
      "Italy",
      "Ivory Coast",
      "Jamaica",
      "Japan",
      "Jordan",
      "Kazakhstan",
      "Kenya",
      "Kuwait",
      "Kyrgyzstan",
      "Laos",
      "Latvia",
      "Lebanon",
      "Lesotho",
      "Liberia",
      "Libya",
      "Liechtenstein",
      "Lithuania",
      "Luxembourg",
      "Madagascar",
      "Malawi",
      "Malaysia",
      "Maldives",
      "Mali",
      "Malta",
      "Mauritania",
      "Mauritius",
      "Mexico",
      "Moldova",
      "Monaco",
      "Mongolia",
      "Montenegro",
      "Morocco",
      "Mozambique",
      "Myanmar",
      "Namibia",
      "Nepal",
      "Netherlands",
      "New Zealand",
      "Nicaragua",
      "Niger",
      "Nigeria",
      "North Macedonia",
      "Norway",
      "Oman",
      "Pakistan",
      "Panama",
      "Paraguay",
      "Peru",
      "Philippines",
      "Poland",
      "Portugal",
      "Qatar",
      "Republic of the Congo",
      "Romania",
      "Russia",
      "Rwanda",
      "Saudi Arabia",
      "Senegal",
      "Serbia",
      "Seychelles",
      "Sierra Leone",
      "Singapore",
      "Slovakia",
      "Slovenia",
      "South Africa",
      "South Korea",
      "Spain",
      "Sri Lanka",
      "Sudan",
      "Sweden",
      "Switzerland",
      "Syria",
      "Taiwan",
      "Tajikistan",
      "Tanzania",
      "Thailand",
      "Togo",
      "Trinidad and Tobago",
      "Tunisia",
      "Turkey",
      "Uganda",
      "Ukraine",
      "United Arab Emirates",
      "United Kingdom",
      "United States",
      "Uruguay",
      "Uzbekistan",
      "Venezuela",
      "Vietnam",
      "Zambia",
      "Zimbabwe",
    ],
    [],
  );
  const [step, setStep] = useState<Step>(initialStep);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const goNext = () => {
    setStep((current) => {
      const next = current < 5 ? ((current + 1) as Step) : current;
      router.replace(`/auth/register?step=${next}`);
      return next;
    });
  };

  const goBack = () => {
    setStep((current) => {
      const prev = current > 1 ? ((current - 1) as Step) : current;
      router.replace(`/auth/register?step=${prev}`);
      return prev;
    });
  };

  const complete = async () => {
    setError(null);
    setLoading(true);
    try {
      await apiRegister({ email, password, firstName, lastName });
      router.push("/americano/new");
    } catch (err) {
      setError("Could not create your account. Please try again.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:text-sm">
          Step {step} / 5
        </p>
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Create your Patelution account
        </h1>
      </header>

      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }, (_, index) => {
          const indexStep = (index + 1) as Step;
          const active = indexStep === step;
          const completeStep = indexStep < step;

          return (
            <div
              key={indexStep}
              className={`h-1.5 flex-1 rounded-full ${
                completeStep
                  ? "bg-teal-400"
                  : active
                    ? "bg-teal-300/80"
                    : "bg-slate-800"
              }`}
            />
          );
        })}
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 5) {
            goNext();
          } else {
            complete();
          }
        }}
      >
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 sm:text-base">
              Let&apos;s start easy. With your name.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                First name
              </label>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                Last name
              </label>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 sm:text-base">
              Now fill in your email. This will be your login.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                This is the time for secrets – choose a strong password.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 sm:text-base">
              What is your birth date?
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm sm:text-base">
              <select className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-2.5 py-2 text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40">
                {months.map((month) => (
                  <option key={month}>{month}</option>
                ))}
              </select>
              <select className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-2.5 py-2 text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40">
                {days.map((day) => (
                  <option key={day}>{day}</option>
                ))}
              </select>
              <select className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-2.5 py-2 text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40">
                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 sm:text-base">
              Phone number and nationality.
            </p>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div>
                <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                  Phone number
                </label>
                <input className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                  Nationality
                </label>
                <select className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base">
                  {countries.map((country) => (
                    <option key={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 sm:text-base">
              And lastly, your location and gender?
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                  Default location
                </label>
                <select className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base">
                  {countries.map((country) => (
                    <option key={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                  Gender
                </label>
                <select className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
            <label className="mt-1.5 flex items-center gap-2 text-xs text-slate-300 sm:text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-teal-400 focus:ring-teal-500"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms?from=register&step=5"
                  className="underline decoration-slate-500 underline-offset-2"
                >
                  Terms of service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy?from=register&step=5"
                  className="underline decoration-slate-500 underline-offset-2"
                >
                  Privacy policy
                </Link>
                .
              </span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={step === 1 ? () => router.back() : goBack}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-slate-50 sm:px-5 sm:text-sm"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="accent-pill inline-flex items-center justify-center px-6 py-2 text-sm font-semibold disabled:opacity-60 sm:text-base"
          >
            {step < 5
              ? "Continue"
              : loading
                ? "Creating account..."
                : "Complete registration"}
          </button>
        </div>
      </form>

      <p className="text-xs text-slate-400 sm:text-sm">
        {error && <span className="mb-2 block text-[11px] text-red-400">{error}</span>}
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-teal-300 hover:text-teal-200"
        >
          Log in
        </Link>
        .
      </p>
    </div>
  );
}

