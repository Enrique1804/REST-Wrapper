import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";
const baseURL = "http://localhost:8080";

const yoga = createYoga({
  schema: createSchema({
    typeDefs: `
    type Item {
      itemId: Int!
      itemName: String!
      description: String!
      location: Location!
    }
    
    type Location {
      locationId: Int!
      state: String!
      address: String!
      phoneNumber: String!
    }
    
    type Query {
      Items: [Item!]!
      Item(itemId: Int): Item
      findByName(name:String!): Item
    }

    input LocationInput{
      state: String
      address: String
      phoneNumber: String
    }

    type Mutation {
      createItem(itemId: Int!, itemName: String!, description: String!, location: LocationInput!): Item
      deleteItem(itemId: Int!): Item
    }
    
    `,
    resolvers: {
      Query: {
        Items: () => {
          return fetch(`${baseURL}/items`).then((res) => res.json());
        },
        Item: (parent, args) => {
          const { itemId } = args;
          return fetch(`${baseURL}/items/${itemId}`)
            .then((res) => res.json())
            .catch((error) => {
              console.error(error);
              return {
                itemId: -1,
                itemName: "",
                description: "",
                location: {
                  locationId: -1,
                  state: "",
                  address: "",
                  phoneNumber: "",
                },
              };
            });
        },
        findByName:(parent,args)=>{},
      },
      Mutation: {
        createItem: (_,args) => {
          return fetch(`${baseURL}/items`, {
            mode: 'no-cors',
            method: "POST",
            headers:{
              "Content-Type": "application/json",
            },
            body: JSON.stringify(args),
          })
          .then((response) => console.log("MENSAJE:" + response))
          .catch((error) => {
            console.error(error);
            throw new Error("Error al crear item");
          });
        },
        deleteItem: (_,args) => {
          const {itemId } = args;
          return fetch(`${baseURL}/items/${itemId}`,{
            method: "DELETE",
          })
          .then((response) => console.log("MENSAJE:" + response))
          .catch((error) => {
            console.log(error);
            throw new Error("Error al eliminar el Item")
          });
        }
      }
    },
  }),
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
