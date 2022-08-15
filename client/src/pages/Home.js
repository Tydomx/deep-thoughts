import React from 'react';
import FriendList from '../components/FriendList';
import ThoughtForm from '../components/ThoughtForm';
import ThoughtList from '../components/ThoughtList';


import Auth from '../utils/auth';
// allows us to make requests to GraphQL server we connected to and made available to app using ApolloProvder component on App.js
import { useQuery } from '@apollo/client';
import { QUERY_THOUGHTS, QUERY_ME_BASIC } from '../utils/queries';


const Home = () => {
  // use useQuery hook to make query request
  const { loading, data } = useQuery(QUERY_THOUGHTS);
  // use object destructuring to extract `data` from the `useQuery` Hook's response and rename it to `userData` to be more descriptive
  const { data: userData } = useQuery(QUERY_ME_BASIC);
  // optional chaining - negates need to check if object exists before accessing its properties
  // no data will exist until query to server is finished
  // if data exists, store it in thoughts constant we created, if data is undefined, then save an empty array ot thoughts component
  const thoughts = data?.thoughts || [];
  // console.log(thoughts);

  const loggedIn = Auth.loggedIn();

  return (
    <main>
      <div className='flex-row justify-space-between'>
        {loggedIn && (
          <div className='col-12 mb-3'>
            <ThoughtForm />
          </div>
        )}
        <div className={`col-12 mb-3 ${loggedIn && 'col-lg-8'}`}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ThoughtList thoughts={thoughts} title="Some Feed for Thought(s)..." />
          )}
        </div>
        {loggedIn && userData ? (
          <div className='col-12 col-lg-3 mb-3'>
            <FriendList
              username={userData.me.username}
              friendCount={userData.me.friendCount}
              friends={userData.me.friends}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Home;
