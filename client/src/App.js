import { useState } from "react";
import axios from "axios";
import "./App.css";
import products from "./products.json";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {

  const [afterCheckout, setAfterCheckout] = useState(false);

  const [quantities, setQuantities] = useState(() => {
    const fromSessionStorage = window.sessionStorage.getItem('quantities');
    if (fromSessionStorage) {
      return JSON.parse(fromSessionStorage);
    }
    let quantities = {};
    products.map(p => {
      quantities[p.productId] = 0;
      return p;
    });
    return quantities;
  });

  const [orders, setOrders] = useState([]);

  const getOrders = () => {
    axios.get("/api/orders", {}).then(res => {
      console.log(res);
      setOrders(res.data);
    });
  };

  const getProductInfo = (productId) => {
    for (var i in products) {
      if (products[i].productId === productId) {
        return products[i];
      }
    }
    return {};
  };

  const handleClickCheckout = () => {
    const today = new Date();
    if (today.getHours() < 10 || today.getHours() >= 22) {
//      alert('The order can only be made after 10 am and before 10 pm.');
  //    return;
    }
    let noneZeroQuantities = {};
    for (var i in quantities) {
      if (quantities[i] !== 0) {
        noneZeroQuantities[i] = quantities[i];
      }
    }
    if (Object.keys(noneZeroQuantities).length === 0) {
      alert('The shopping cart is empty. Cannot checkout.');
      return;
    }
    axios.post("/api/checkout", {
      quantities: noneZeroQuantities
    }).then(res => {
      if (res.data.success) {
        let copy = { ...quantities };
        for (var i in copy) {
          copy[i] = 0;
        }
        setQuantities(copy);
        sessionStorage.removeItem('quantities');
        setAfterCheckout(true);
        getOrders();
      }
    })
      .then(error => console.log(error));

  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const minus = (e, productId) => {
    let copy = JSON.parse(JSON.stringify(quantities));
    copy[productId] = Math.max(copy[productId] - 1, 0);
    setQuantities(copy);
    window.sessionStorage.setItem('quantities', JSON.stringify(copy));
  };

  const plus = (e, productId) => {
    let copy = JSON.parse(JSON.stringify(quantities));
    copy[productId] = Math.max(copy[productId] + 1, 0);
    setQuantities(copy);
    window.sessionStorage.setItem('quantities', JSON.stringify(copy));
  }


  return (
    <>
      {!afterCheckout && (<Container id="app">
        {
          products.map(p =>
            <Container className="product-item" key={p.productId}>
              <Row>
                <Col md={3}>
                  <img width="200" src={p.imageUrl} alt="" />
                </Col>
                <Col md={9}>
                  <div>{p.title}</div>
                  <div>{p.description}</div>
                  <div className="quantity-container">
                    Quantity: &nbsp;
                    <Button onClick={e => minus(e, p.productId)} className="quantity-button">-</Button>
                    <Form.Control
                      disabled
                      value={quantities[p.productId]}
                      className="quantity-button"
                    />
                    <Button onClick={e => plus(e, p.productId)} className="quantity-button">+</Button>
                  </div>
                </Col>
              </Row>
            </Container>
          )
        }
        <Row>
          <Col>
            <form onSubmit={handleSubmit}>
              <Button id="submit" className="full-width" onClick={handleClickCheckout}>Checkout</Button>
            </form>
          </Col>
        </Row>
      </Container>)}

      {afterCheckout && (<Container>
        <Row>
          <Col>
            <h2>Orders you made:</h2>
            {
              orders.map((o, index) =>
                <div className="order-item" key={index}>
                  <div>Product: {getProductInfo(o.product_id).title}</div>
                  <div>Quantity: {o.quantity}</div>
                  <div>UTC Date: {o.created}</div>
                </div>
              )
            }
          </Col></Row></Container>)}
    </>
  );
};

export default App;
