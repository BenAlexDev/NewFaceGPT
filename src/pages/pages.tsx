import Layout from "@/components/Layouts/Index";
import axios from "axios";
import Cookies from "universal-cookie";
import React, { useEffect, useState } from "react";

type PageData = {
  id: string;
  name: string;
  category: string;
  access_token: string;
};
type Posts = {
  id: string;
  message: string;
};

type Comments = {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
};

const Pages = () => {
  const [pagesData, setPagesData] = useState<PageData[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageData>({
    id: "",
    name: "",
    category: "",
    access_token: "",
  });
  const [posts, setPosts] = useState<Posts[]>([]);
  const [postData, setPostData] = useState<Posts>({
    id: "",
    message: "",
  });
  const [commentsData, setCommentsData] = useState<Comments[]>([]);
  const cookies = new Cookies();
  useEffect(() => {
    fetchUserPages();
  }, []);
  const accessToken = cookies.get("fb_access");

  const fetchUserPages = async () => {
    const response = await axios.get(
      "https://graph.facebook.com/168159269633291/accounts",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.data.data) {
      setPagesData(response.data.data);
    }
  };
  const fetchPagesPost = async (pageId: string, token: string) => {
    const response = await axios.get(
      `https://graph.facebook.com/${pageId}/feed`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.data) {
      setPosts(response.data.data);
    }
  };
  
  const fetchPostComments = async (postId: string) => {
    const response = await axios.get(
      `https://graph.facebook.com/${postId}/comments`,
      {
        headers: {
          Authorization: `Bearer ${selectedPage.access_token}`,
        },
      }
    );
    if (response.data.data) {
      setCommentsData(response.data.data);
    }
  };
  
  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "100px",
        }}
      >
        <ul>
          {pagesData.map((item, i) => (
            <li
              key={item.id}
              style={{ display: "flex", gap: "50px", cursor: "pointer" }}
              onClick={async () => {
                setSelectedPage(item);
                await fetchPagesPost(item.id, item.access_token);
              }}
            >
              <span>Name:{item.name}</span>
              <span>Category:{item.category}</span>
            </li>
          ))}
        </ul>
        {!selectedPage.name ? (
          <h2>Please Click on the list to view posts for the selected page</h2>
        ) : (
          <>
            <h2> {`List of Post's assocaited to ${selectedPage.name}`}</h2>
            <ul>
              {posts.map((item, i) => (
                <li
                  key={item.id}
                  style={{ display: "flex", gap: "50px", cursor: "pointer" }}
                  onClick={async () => {
                    console.log(item.id, "asdada");
                    setPostData(item);
                    await fetchPostComments(item.id);
                  }}
                >
                  <span>Id:{item.id}</span>
                  <span>Message:{item.message}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {selectedPage.name &&
          (!postData.id ? (
            <h2>
              Please Click on the Post to view Comments for the selected posts
            </h2>
          ) : (
            <>
              <h2> {`List of Comments's assocaited to ${postData.message}`}</h2>
              <ul>
                {commentsData.map((item, i) => (
                  <li
                    key={item.id}
                    style={{ display: "flex", gap: "50px", cursor: "pointer" }}
                  >
                    <span>Id:{item.id}</span>
                    <span>Comments:{item.message}</span>
                    <span>From:{item.from.name}</span>
                  </li>
                ))}
              </ul>
            </>
          ))}
      </div>
    </Layout>
  );
};

export default Pages;
