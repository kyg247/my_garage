# 🚗 Dream Garage

A modern React application for managing your dream car collection with budget tracking and advanced search capabilities. Build your perfect garage by selecting from a curated collection of luxury and everyday vehicles while staying within your budget.

![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![Material-UI](https://img.shields.io/badge/Material--UI-6.4.7-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🎯 Budget Management

- Set and update your total budget
- Real-time tracking of remaining budget
- Automatic calculation of collection cost
- Budget validation when adding vehicles

### 🔍 Advanced Search & Filtering

- **Search by Budget**: Filter vehicles by price ranges (₹1-10 Lakh, ₹10-20 Lakh, etc.)
- **Search by Maker**: Filter by manufacturer (Toyota, Mercedes, BMW, etc.)
- **Search by Vehicle Type**: Filter by category (SUV, Sedan, Sports, Convertible, etc.)
- **Name Search**: Quick search by vehicle name
- Combined filtering for precise results

### 🏎️ Vehicle Collection

- Browse 100+ vehicles including:
  - Luxury cars (Rolls Royce, Bentley, Lamborghini, Ferrari)
  - Sports cars (Porsche, BMW M Series, Mustang)
  - SUVs (Range Rover, Land Cruiser, G-Wagon)
  - Electric vehicles (Tesla models)
  - Motorcycles (Triumph, Harley Davidson, Ducati)
  - Everyday vehicles (Toyota, Mahindra, Hyundai)

### 🎨 Modern UI/UX

- Dark theme with gradient backgrounds
- Responsive design for all screen sizes
- Material-UI components for consistent styling
- Smooth animations and transitions
- Intuitive user interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd my_garage
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## 📦 Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## 🏗️ Project Structure

```
my_garage/
├── public/
│   ├── images/          # Vehicle images
│   └── index.html
├── src/
│   ├── App.js           # Main app component
│   ├── Garage.js        # Main garage component with state management
│   ├── Budget.js        # Budget management component
│   ├── Collection.js    # Available vehicles display
│   ├── Cars.js          # Selected garage vehicles display
│   ├── CarItem.js       # Individual vehicle card component
│   ├── SearchBar.js     # Search and filter component
│   ├── Data.js          # Vehicle data array
│   ├── Styles.js        # Styled components
│   └── index.js         # App entry point
└── package.json
```

## 🎯 Key Components

### Garage Component

The main component that manages:

- Budget state (total, remaining, spent)
- Garage collection state
- Search filter state
- Car selection/deselection logic

### Budget Component

Displays:

- Total allocated budget
- Remaining budget
- Collection cost
- Budget update form

### SearchBar Component

Provides:

- Tab-based search (Budget/Maker)
- Budget range selection
- Vehicle type filtering
- Maker filtering
- Name search functionality

### Collection Component

Renders filtered list of available vehicles based on search criteria.

### Cars Component

Displays the user's selected garage collection with remove functionality.

## 💻 Technology Stack

- **React 18.2.0** - UI library
- **Material-UI (MUI) 6.4.7** - Component library
- **Emotion** - CSS-in-JS styling
- **React Scripts 5.0.1** - Build tooling

## 📊 Vehicle Data Structure

Each vehicle in the collection contains:

```javascript
{
  car: "Vehicle Name",
  cost: 2200000,              // Price in INR
  img: "/images/image.jpg",    // Image path
  maker: "Manufacturer",       // Brand name
  type: "SUV",                 // Vehicle category
  fuel_type: "Diesel",         // Fuel type
  drivetrain: "4x4"            // Drivetrain type
}
```

## 🎨 Features in Detail

### Budget Management

- Default budget: ₹60,000,000 (60 Crore)
- Users can update budget at any time
- Budget resets collection when updated
- Prevents adding vehicles exceeding remaining budget

### Search Capabilities

- **Budget Ranges**: Any Budget, ₹1-10 Lakh, ₹10-20 Lakh, ₹20-50 Lakh, ₹50-1 Crore, Above ₹1 Crore
- **Vehicle Types**: Hatchback, Sedan, SUV, Compact SUV, Sports, Pickup, Convertible, Two Wheeler, etc.
- **Makers**: Toyota, Mercedes, BMW, Porsche, Lamborghini, Ferrari, Tesla, and more
- **Name Search**: Real-time filtering by vehicle name

### Collection Management

- Add vehicles to garage with one click
- Remove vehicles from garage
- Automatic budget recalculation
- Visual feedback for actions

## 🖼️ Vehicle Categories

The app includes vehicles across multiple categories:

- **Luxury Sedans**: Rolls Royce, Bentley, Mercedes S-Class
- **Sports Cars**: Ferrari, Lamborghini, Porsche 911
- **SUVs**: Range Rover, Land Cruiser, G-Wagon
- **Electric**: Tesla Model S, Model 3, Cybertruck
- **Motorcycles**: Triumph, Harley Davidson, Ducati
- **Everyday Vehicles**: Toyota, Mahindra, Hyundai

## 🔧 Customization

### Adding New Vehicles

Edit `src/Data.js` to add new vehicles:

```javascript
{
  car: "Your Vehicle Name",
  cost: 5000000,
  img: "/images/your-image.jpg",
  maker: "Manufacturer",
  type: "SUV",
  fuel_type: "Petrol",
  drivetrain: "AWD"
}
```

### Styling

- Main styles: `src/App.css`
- Component styles: `src/Styles.js`
- Material-UI theme customization: Modify styled components in individual files

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

Built with ❤️ for car enthusiasts

---

**Note**: This is a frontend-only application. All data is stored locally in the component state and resets on page refresh.
