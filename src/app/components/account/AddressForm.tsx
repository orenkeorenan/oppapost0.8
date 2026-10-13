
"use client";

import { useState, type FormEvent } from "react";

type AddressFormProps = {
  initialAddress?: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    stateProvince: string | null;
    postalCode: string;
    country: string;
  } | null;
};


const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China",
  "Colombia", "Comoros", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti",
  "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Republic of the Congo", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe",
].sort((a, b) => a.localeCompare(b));


export function AddressForm({ initialAddress }: AddressFormProps) {
  const [recipientName, setRecipientName] = useState(
    initialAddress?.recipientName ?? "",
  );
  const [phone, setPhone] = useState(initialAddress?.phone ?? "");
  const [address, setAddress] = useState(initialAddress?.address ?? "");
  const [city, setCity] = useState(initialAddress?.city ?? "");
  const [stateProvince, setStateProvince] = useState(
    initialAddress?.stateProvince ?? "",
  );
  const [postalCode, setPostalCode] = useState(
    initialAddress?.postalCode ?? "",
  );
  const [country, setCountry] = useState(initialAddress?.country ?? "");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsSaving(true);

    try {
      const response = await fetch("/api/account/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          phone,
          address,
          city,
          stateProvince,
          postalCode,
          country,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.message ?? "Unable to save your delivery address.");
        return;
      }

      window.location.reload();
    } catch {
      setIsError(true);
      setMessage("Unable to connect. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section>
      <h2>
        {initialAddress
          ? "Edit Delivery Address"
          : "Add Delivery Address"}
      </h2>
      <p>Enter the address where you want Oppapost to deliver your packages.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="delivery-recipient">Recipient Name</label>
          <input
            id="delivery-recipient"
            autoComplete="name"
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
            maxLength={100}
            required
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="delivery-phone">Phone Number</label>
          <input
            id="delivery-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+62..."
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            maxLength={30}
            required
            disabled={isSaving}
          />
        </div>

        
        <div>
            <label htmlFor="delivery-country">Country</label>
            <select
                id="delivery-country"
                name="country"
                autoComplete="country-name"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                required
                disabled={isSaving}
            >
                <option value="">Select your country</option>
                {countries.map((item) => (
                <option key={item} value={item}>
                    {item}
                </option>
                ))}
            </select>
        </div>


        <div>
          <label htmlFor="delivery-address">Street Address</label>
          <input
            id="delivery-address"
            autoComplete="street-address"
            placeholder="Street, building, house number"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            maxLength={255}
            required
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="delivery-city">City / Town</label>
          <input
            id="delivery-city"
            autoComplete="address-level2"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            maxLength={191}
            required
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="delivery-state">
            State / Province / Region (optional)
          </label>
          <input
            id="delivery-state"
            autoComplete="address-level1"
            value={stateProvince}
            onChange={(event) => setStateProvince(event.target.value)}
            maxLength={191}
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="delivery-postal">Postal Code</label>
          <input
            id="delivery-postal"
            autoComplete="postal-code"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            maxLength={20}
            required
            disabled={isSaving}
          />
        </div>

        {message && (
          <p role={isError ? "alert" : "status"}>{message}</p>
        )}

        <button
          type="submit"
          className="button button--brand"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : initialAddress
              ? "Update Delivery Address"
              : "Save Delivery Address"}
        </button>
      </form>
    </section>
  );
}
