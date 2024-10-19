import React, { useEffect, useState } from 'react';
import { Container, Table, Row, Col, Pagination, Form, Button} from 'react-bootstrap';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register required components for Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [monthlyStatistics, setMonthlyStatistics] = useState({});
    const [priceRangeStatistics, setPriceRangeStatistics] = useState({});
    const [categoryStatistics, setCategoryStatistics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState('3'); // Default to January
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const months = [
      { name: 'January', value: '1' },
      { name: 'February', value: '2' },
      { name: 'March', value: '3' },
      { name: 'April', value: '4' },
      { name: 'May', value: '5' },
      { name: 'June', value: '6' },
      { name: 'July', value: '7' },
      { name: 'August', value: '8' },
      { name: 'September', value: '9' },
      { name: 'October', value: '10' },
      { name: 'November', value: '11' },
      { name: 'December', value: '12' },
  ];

    useEffect(() => {
      
        // Fetch data from the combined API
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/products/combined-statistics/${selectedMonth}`); // Change month as needed
                const { monthVizeProducts, monthlyStatistics, priceRangeStatistics, categoryStatistics } = response.data;
                const responseProducts = monthVizeProducts.products;
                setProducts(responseProducts);
                setMonthlyStatistics(monthlyStatistics);
                setPriceRangeStatistics(priceRangeStatistics);
                setCategoryStatistics(categoryStatistics);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

       // Call fetch data only if a month is selected
    if (selectedMonth) 
        fetchData();
    
}, [selectedMonth]);  // Add selectedMonth to dependency array

     // Handle search input change
     const handleSearchChange = async (e) => {
      const searchTerm = e.target.value.trim();
      setSearchTerm(searchTerm);
      setPage(1);
  
      try {
          if (searchTerm) {
              const response = await axios.get(`http://localhost:5000/api/products?month=${selectedMonth}&keyword=${searchTerm}`);
              setProducts(response.data.products);  
          } else {
              const response = await axios.get(`http://localhost:5000/api/products/${selectedMonth}`);
              setProducts(response.data.products);  
          }
      } catch (error) {
          console.error('Error fetching products:', error);
      }
  };
  

  const handleMonthChange = async (e) => {
    const selectedMonth = e.target.value;  // Get the selected month from the dropdown or input
    setSelectedMonth(selectedMonth);
  };


    // Prepare Bar Chart data for price range statistics
    const barChartData = {
        labels: Object.keys(priceRangeStatistics),
        datasets: [
            {
                label: 'Number of Items',
                data: Object.values(priceRangeStatistics),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    // Prepare Pie Chart data for category statistics
    const pieChartData = {
        labels: categoryStatistics.map(stat => stat.category),
        datasets: [
            {
                label: 'Number of Items',
                data: categoryStatistics.map(stat => stat.count),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }
        ]
    };

    return (
        <Container fluid>
            
             {/* Search Bar */}
             

            {/* Section 1: Products Table */}
            <Row className="my-4 mt-5">
                <Col>
                    <h2>Products</h2>
                    <Row className="my-4">
                        <Col md={8}>
                            <Form.Control
                                type="text"
                                placeholder="Search by Title, Description, or Price..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Select value={selectedMonth} onChange={handleMonthChange}>
                                {months.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Sold</th>
                                <th>Images</th>
                            </tr>
                        </thead>
                        <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.title}</td>
                                <td>{product.description}</td>
                                <td>{product.price}</td>
                                <td>{product.category}</td>
                                <td>{product.sold ? 'Yes' : 'No'}</td>
                                <td>
                                    <img 
                                        src={product.image} 
                                        alt={product.title} 
                                        className="img-fluid img-thumbnail w-20" 
                                    />
                                </td>
                            </tr>
                        ))}

                        </tbody>
                    </Table>
                     {/* Pagination */}
                     {/* <Pagination>
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={index + 1 === page}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                            </Pagination> */}
                </Col>
            </Row>

            {/* Section 2: Monthly Statistics */}
            
            <Row className="my-4">
                <Col md={6}>
                    <h2>Monthly Statistics</h2>
                    <Table bordered>
                        <tbody>
                            <tr>
                                <td>Total Sales Amount</td>
                                <td>${monthlyStatistics.totalSalesAmount}</td>
                            </tr>
                            <tr>
                                <td>Total Sold Items</td>
                                <td>{monthlyStatistics.totalSoldItems}</td>
                            </tr>
                            <tr>
                                <td>Total Unsold Items</td>
                                <td>{monthlyStatistics.totalUnsoldItems}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>

            {/* Section 3: Price Range Bar Chart */}
            
            <Row className="my-4">
                <Col>
                    <h2>Price Range Distribution</h2>
                    <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </Col>
            </Row>

            {/* Section 4: Category Pie Chart */}
            
            <Row className="my-4">
                <Col md={6}>
                    <h2>Category Distribution</h2>
                    <Pie data={pieChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                </Col>
            </Row>
          
        </Container>
    );
};

export default Dashboard;
