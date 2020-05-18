import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import ProductMenu from "./menu/ProductFilter";
import ProductsContainer from "./section/ProductContainer";
import Pagination from "./section/Pagination";
import { Typography, Container } from "@material-ui/core";
import { getProducts } from "../../context/actions/ProductAction";
import LoadingProgres from "../utils/LoadingProgress";
import { makeStyles, Theme } from "@material-ui/core/styles";

const MarketLanding = ({ getProducts, products }: any) => {
  const classes = useStyles();

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);

  let currentProducts = [];
  let resultCount = 0;
  if (products.data) {
    // Get current product
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    currentProducts = products.data.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );
    resultCount = products.data.length;
  }

  // Change page
  const paginate = (e: any, pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  // Component

  const NoResult = (
    <div className={classes.noResult}>
      <Typography>No relevant result was found</Typography>
    </div>
  );

  const Content = (
    <div>
      <Typography className={classes.resultText}>
        {resultCount} {resultCount > 1 ? "Results" : "Result"}
      </Typography>
      <div>
        {/* Products */}
        <ProductsContainer products={currentProducts} />

        {/* Pagination */}
        <div className={classes.pagination}>
          <Pagination
            productsPerPage={productsPerPage}
            totalProducts={resultCount}
            paginate={paginate}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Container maxWidth="lg" style={{ minHeight: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "column", height: "auto" }}>
        {/* Menu */}
        <div>
          <ProductMenu />
        </div>

        {/* Content */}
        {products && products.isLoading ? (
          <LoadingProgres />
        ) : products.data && products.data.length > 0 ? (
          Content
        ) : (
          NoResult
        )}
      </div>
    </Container>
  );
};

// Style

const useStyles = makeStyles((theme: Theme) => ({
  noResult: {
    height: "300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    padding: "3em",
  },
  resultText: {
    margin: "10px 0 10px 0",
  },
}));

// Redux
const mapStateToProps = (state: any) => ({
  error: state.error,
  products: state.product,
});

export default connect(mapStateToProps, { getProducts })(MarketLanding);
