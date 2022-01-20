import React, {useEffect, useState} from "react";
import styles from "./EventDetails.module.scss";

type Donation = {
  preferredName: string,
  currencySymbol: string,
  publicAmount: number,
  currency: string,
  message?: string
};


interface Dictionary {
  [key: string]: string | number | null | undefined
};

const Donations = () => {
  const donationUrl = "https://api.raisely.com/v3/profiles/b37711e0-8eb2-11eb-bbdb-558a75b6889f/donations?offset=0&isSuspicious=false&limit=3&sort=createdAt&order=desc&campaign=c660c910-0ddc-11eb-982d-2522a70939d9"
  const [donations, setDonations] = useState<Donation[]>([])

  const getNextTick = () => {
    fetch(donationUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    })
    .then(response => response.json())
    .then(res => {
      const donationsData = [...res.data.map((donation: Dictionary) => {
          return {
            preferredName: donation.preferredName,
            currencySymbol: donation.currencySymbol,
            publicAmount: donation.publicAmount,
            currency: donation.currency,
            message: donation.message
          } as Donation
      })] as Donation[]
      setDonations(donationsData)
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      getNextTick();
      // console.log(donations);
    }, 5000);
    return () => clearInterval(interval);
  });

  const donationString = (donation: Donation) => 
      `${donation.preferredName} donated ${donation.currencySymbol}${donation.publicAmount} ${donation.currency}${donation.message  ? ` - ${donation.message}` : ""}`

  return (
  <div>
    { donations.length > 0 && (
      <p><strong>Latest donations:</strong> 
        { donations.map(donation => donationString(donation)).join(', ')  }
    </p>)} 
  </div>);
};

export default Donations;
