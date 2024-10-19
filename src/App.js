import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import DashboardScreen from './DashboardScreen';
const App = () => {
  return (
    <>
        <main className='py-3'>
          <Header />
          <Container>
            <DashboardScreen/>
          </Container>
        </main>
        <Footer />
      </>
  );
};

export default App;