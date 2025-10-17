const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pharmacies = [
  // Vijayawada
  {
    id: 1,
    name: "Apollo Pharmacy",
    address: "Hanumanpet, Vijayawada",
    phone: "0866-1234567",
    city: "Vijayawada",
    lat: 16.516369,
    lng: 80.613396,
    medicines: [
      { name: "Insulin", inStock: true, price: 450 },
      { name: "Aspirin", inStock: true, price: 50 },
      { name: "Ventolin", inStock: false, price: 320 }
    ]
  },
  {
    id: 2,
    name: "MedPlus",
    address: "Labbipet, Vijayawada",
    phone: "0866-8765432",
    city: "Vijayawada",
    lat: 16.520073,
    lng: 80.639397,
    medicines: [
      { name: "Insulin", inStock: false, price: 430 },
      { name: "EpiPen", inStock: true, price: 1200 }
    ]
  },
  {
    id: 3,
    name: "Wellness Forever",
    address: "Bharathi Nagar, Vijayawada",
    phone: "0866-5555666",
    city: "Vijayawada",
    lat: 16.512646,
    lng: 80.627679,
    medicines: [
      { name: "Aspirin", inStock: true, price: 55 },
      { name: "Paracetamol", inStock: true, price: 25 }
    ]
  },
  // Bangalore
  {
    id: 4,
    name: "Apollo Pharmacy",
    address: "MG Road, Bangalore",
    phone: "080-12345678",
    city: "Bangalore",
    lat: 12.9744,
    lng: 77.6171,
    medicines: [
      { name: "Insulin", inStock: true, price: 450 },
      { name: "Cetrizine", inStock: true, price: 12 }
    ]
  },
  {
    id: 5,
    name: "MedPlus",
    address: "Koramangala, Bangalore",
    phone: "080-87654321",
    city: "Bangalore",
    lat: 12.9352,
    lng: 77.6245,
    medicines: [
      { name: "Insulin", inStock: true, price: 410 },
      { name: "EpiPen", inStock: false, price: 1200 }
    ]
  },
  // Hyderabad
  {
    id: 6,
    name: "Metro Meds",
    address: "Punjagutta, Hyderabad",
    phone: "040-22245510",
    city: "Hyderabad",
    lat: 17.4213,
    lng: 78.4483,
    medicines: [
      { name: "Insulin", inStock: true, price: 470 },
      { name: "Paracetamol", inStock: true, price: 19 }
    ]
  },
  {
    id: 7,
    name: "Care Pharmacy",
    address: "Ameerpet, Hyderabad",
    phone: "040-55356565",
    city: "Hyderabad",
    lat: 17.4375,
    lng: 78.4467,
    medicines: [
      { name: "Aspirin", inStock: false, price: 65 },
      { name: "EpiPen", inStock: true, price: 1180 }
    ]
  },
  // Chennai
  {
    id: 8,
    name: "Apollo Pharmacy",
    address: "T Nagar, Chennai",
    phone: "044-22223344",
    city: "Chennai",
    lat: 13.0412,
    lng: 80.2337,
    medicines: [
      { name: "Insulin", inStock: true, price: 480 },
      { name: "Ventolin", inStock: false, price: 310 },
      { name: "Paracetamol", inStock: true, price: 15 }
    ]
  },
  {
    id: 9,
    name: "Wellness Central",
    address: "Adyar, Chennai",
    phone: "044-45556655",
    city: "Chennai",
    lat: 13.0067,
    lng: 80.2572,
    medicines: [
      { name: "Aspirin", inStock: true, price: 59 },
      { name: "Cetrizine", inStock: true, price: 13 }
    ]
  }
];

app.get('/', (req, res) => {
  res.json({ message: "🚀 MediFind Backend is LIVE!" });
});

// FIXED FILTER: strict city match for exact selection
app.get('/api/search', (req, res) => {
  const medicine = (req.query.medicine || '').toLowerCase();
  const location = (req.query.location || '').toLowerCase();
  const results = [];

  pharmacies.forEach(pharmacy => {
    // Only match exact chosen city if 'location' present
    if (location && pharmacy.city.toLowerCase() !== location) return;
    pharmacy.medicines.forEach(med => {
      if (med.name.toLowerCase().includes(medicine)) {
        results.push({
          pharmacyName: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone,
          city: pharmacy.city,
          lat: pharmacy.lat,
          lng: pharmacy.lng,
          medicine: med.name,
          inStock: med.inStock,
          price: med.price
        });
      }
    });
  });
  res.json({ results });
});

app.get('/api/pharmacies', (req, res) => {
  res.json(pharmacies);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
