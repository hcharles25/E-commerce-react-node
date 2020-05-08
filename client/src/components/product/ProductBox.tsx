import React from "react";
import { connect } from "react-redux";
import { addProductToCart } from "../../context/actions/CartAction";
import { Card, Button } from "react-bootstrap";

interface IProductBox {
  image: string;
  title: string;
  desc: string;
  price: number;
  _id: string;
  addProductToCart(productId: string): any;
}

const ProductBox = ({
  _id,
  image,
  title,
  desc,
  price,
  addProductToCart,
}: IProductBox) => {
  // const handleAddToCart = (productId: string) => {
  //   addProductToCart(productId);
  // };

  return (
    <Card>
      <Card.Img
        variant="top"
        src={image}
        style={{ width: "100%", height: "220px" }}
      />
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{desc}</Card.Text>

        <span style={{ fontSize: "1.5rem" }}>
          <strong>$ {price}</strong>
        </span>
      </Card.Body>
      <Card.Footer style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outline-success"
          href="#"
          onClick={() => addProductToCart(_id)}
        >
          Add to Cart
        </Button>
        <Button variant="outline-success" href={`/product/${_id}`}>
          Browse
        </Button>
      </Card.Footer>
    </Card>
  );
};
const mapStateToProps = (state: any) => ({
  auth: state.auth,
  product: state.product,
  cart: state.cart,
});

export default connect(mapStateToProps, { addProductToCart })(ProductBox);
