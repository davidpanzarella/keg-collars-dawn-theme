class ProductSwitcher extends HTMLElement {
  set product(data) {
    this._product = data;
    this.render();
  }

  connectedCallback() {
    const collection = this.dataset.collection;
    const currentProductHandle = this.dataset.handle;
    if (!collection || !currentProductHandle) return;
    this.fetchRelatedProducts(collection);
  }

  async fetchRelatedProducts(collection) {
    try {
      const response = await fetch('https://keg-collars-shop.myshopify.com/api/2024-01/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': '5368142c7175d20d92779a18bc0a0649'
        },
        body: JSON.stringify({
          query: `{
            collection(handle: "${collection}") {
              handle
              products(first: 200) {
                edges {
                  node {
                    availableForSale
                    onlineStoreUrl
                    title
                    handle
                    metafields(
                      identifiers: [
                        {key: "color", namespace: "custom"},
                        {key: "format", namespace: "custom"},
                        {key: "shape", namespace: "custom"},
                        {key: "size", namespace: "custom"},
                        {key: "template_name", namespace: "custom"},
                        {key: "template_options", namespace: "custom"},
                        {key: "type", namespace: "custom"}
                      ]
                    ) {
                      value
                      key
                    }
                    images(first: 2) {
                      nodes {
                        transformedSrc(maxWidth: 250)
                      }
                    }
                  }
                }
              }
            }
          }`
        })
      });

      const jsonResponse = await response.json();
      const removeEdgeNodes = jsonResponse.data.collection.products.edges.map((edge) => edge.node);
      const transformed = removeEdgeNodes.map((product) => this.transformProductData(product));
      this.renderProductOptions(transformed);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  }

  transformProductData(product) {
    const flattenMetafields = (metafields) =>
      metafields.reduce(
        (acc, metafield) => {
          acc[metafield.key] = metafield.value;
          return acc;
        },
        {
          // Set default values for expected metafields to null
          color: null,
          shape: null,
          size: null,
          template_name: null,
          template_options: null
        }
      );

    return {
      active: product.availableForSale,
      title: product.title,
      handle: product.handle,
      currentProduct: this.dataset.handle === product.handle,
      images: product.images.nodes.map((node) => node.transformedSrc),
      ...flattenMetafields(product.metafields.filter(Boolean)),
      url: product.onlineStoreUrl
    };
  }

  renderProductOptions(relatedProducts) {
    if (!Array.isArray(relatedProducts) || relatedProducts.length === 0) {
      console.log('No related products to render');
      // Optionally, handle the empty state, e.g., display a message or hide the component
      return;
    }

    // Get the current product based on the handle
    const getCurrentProduct = relatedProducts.find((product) => product.handle === this.dataset.handle);
    const {
      shape: currentShape,
      size: currentSize,
      color: currentColor,
      template_name: currentTemplateName,
      template_options: currentTemplateOptions
    } = getCurrentProduct;

    // Get related products based on the current product's template_name first, then by shape, size, color, and template_options
    const { colors, shapes, sizes, templates } = relatedProducts.reduce(
      (products, product) => {
        const { color, handle, images, shape, size, template_name, template_options, title, type } = product;
        // Set the title attribute based on the category

        if (template_name === currentTemplateName) {
          const hasTemplateOptions = !!template_options;
          const isSameColor = color === currentColor;
          const isSameShape = shape === currentShape;
          const isSameSize = size === currentSize;
          const isSameTemplateOptions = template_options === currentTemplateOptions;

          // Color is a JSON-encoded array string; parse and use the first color
          const parsedColor = JSON.parse(color);

          // Initialize categories as arrays if they don't exist
          products.shapes = products.shapes || [];
          products.sizes = products.sizes || [];
          products.colors = products.colors || [];
          products.templates = products.templates || [];

          if ((hasTemplateOptions && isSameTemplateOptions && isSameColor) || (!hasTemplateOptions && isSameColor)) {
            products.shapes.push({
              title: shape,
              alt: `View the ${shape} ${type} version for this ${parsedColor[0]} ${title} `,
              url: handle
            });
          }

          if (isSameShape && isSameColor) {
            products.sizes.push({
              title: size,
              alt: `View the ${size} size for this ${parsedColor[0]} ${title} ${type}`,
              url: handle
            });
          }

          if ((isSameTemplateOptions && isSameShape && isSameSize) || (isSameShape && isSameSize)) {
            if (parsedColor.length > 0) {
              products.colors.push({
                title: parsedColor[0],
                alt: `View the ${color} version for this ${title} ${type}`,
                url: handle
              });
            }
          }

          if (hasTemplateOptions && isSameShape && isSameSize && isSameColor) {
            products.templates.push({
              title: template_options,
              alt: `View the ${template_options} template for this ${parsedColor[0]} ${size} ${type}`,
              images: images,
              url: handle
            });
          }
        }

        return products;
      },
      { shapes: [], sizes: [], colors: [], templates: [] }
    );

    // console.log(`ProductSwitcher / relatedProductsFiltered:`, {
    //   shapes,
    //   sizes,
    //   colors,
    //   templates
    // });

    // create options UI for each category
    this.createOptionsUI('Shape', shapes, currentShape);
    this.createOptionsUI('Size', sizes, currentSize);
    this.createOptionsUI('Color', colors, JSON.parse(currentColor)[0]);
    this.createOptionsUI('Template', templates, currentTemplateOptions);
  }

  createOptionsUI(categoryName, optionsArray, currentOption) {
    const type = categoryName.toLowerCase();
    // Filter out options to ensure they are unique and relevant
    const uniqueOptions = Array.from(new Set(optionsArray.map((option) => option.title)))
      .sort((a, b) => a.localeCompare(b))
      .map((title) => optionsArray.find((option) => option.title === title));

    // Proceed only if there are unique options to display
    if (uniqueOptions.length > 1) {
      let container = this.querySelector(`.${type}-container`);
      if (!container) {
        container = document.createElement('div');
        container.className = `tw-my-6 sm:tw-flex sm:tw-justify-between ${type}-container`;
        this.appendChild(container);
      } else {
        // Clear existing content
        container.innerHTML = '';
      }

      const fieldset = document.createElement('fieldset');
      container.appendChild(fieldset);

      const legend = document.createElement('legend');
      legend.className = 'form__label';
      legend.textContent = categoryName;
      fieldset.appendChild(legend);

      const optionsGrid = document.createElement('div');
      optionsGrid.className = `tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-1 lg:tw-grid-cols-3`;
      fieldset.appendChild(optionsGrid);

      uniqueOptions.forEach((option) => {
        const titleDisplay = option.title;
        const altText = option.alt;
        const optionElement = document.createElement('div');
        optionElement.className = `tw-relative tw-flex tw-border rounded-md tw-align-center tw-justify-center focus:outline-none hover:tw-bg-stone-50 ${
          titleDisplay === currentOption
            ? 'tw-cursor-default tw-border-button tw-ring-2 tw-ring-button'
            : 'tw-border-stone-300'
        }`;

        const hasImage = !!option.images?.length;
        const imageUrl = hasImage && (option.images[1] || option.images[0]);
        let imageDisplay;

        if (hasImage) {
          imageDisplay = document.createElement('img');
          imageDisplay.src = imageUrl;
          imageDisplay.alt = altText;
          imageDisplay.width = 250;
          imageDisplay.height = 250;
          imageDisplay.loading = 'lazy';
          imageDisplay.className = 'tw-rounded-md object-cover w-full h-full tw-bg-background';
        }

        if (titleDisplay !== currentOption) {
          const link = document.createElement('a');
          link.type = 'link';
          link.href = option.url;
          link.title = altText;

          if (hasImage) {
            link.appendChild(imageDisplay);
            // // Append text after the image
            // const textNode = document.createTextNode(` ${titleDisplay}`); // Added space for separation
            // link.appendChild(textNode);
          } else {
            link.className = 'tw-px-3 tw-py-2';
            link.textContent = titleDisplay;
          }

          optionElement.appendChild(link);
        } else {
          if (hasImage) {
            optionElement.appendChild(imageDisplay);
            // If you want the title to appear even when there's an image for the current option
            const textNode = document.createTextNode(` ${titleDisplay}`);
            // optionElement.appendChild(textNode);
          } else {
            // Display text for the current option
            optionElement.classList.add('tw-px-3', 'tw-py-2');
            optionElement.textContent = titleDisplay;
          }
          // Mark as current selection
          optionElement.classList.add('current');
        }

        optionsGrid.appendChild(optionElement);
      });
    }
  }
}
customElements.define('product-switcher', ProductSwitcher);
