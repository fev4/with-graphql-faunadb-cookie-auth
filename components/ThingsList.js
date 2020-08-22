import React, { useState } from 'react';
import Thing from './Thing';
import { useQuery, useMutation, queryCache } from 'react-query';
import { request } from 'graphql-request';

import { user } from './UserContext';

const GET_THINGS = `
 query FindAllThings {
  findAllThings {
    data {
      _id
      name
    }
  }
}
`;

const CREATE_THING = `
  mutation CreateThing($data: ThingInput!) {
    createThing(data: $data) {
      _id
      name
    }
  }
`;

export default function ThingList() {
  const { id } = user();
  const [isCreating, setIsCreating] = useState(false);

  const { data: things, isFetching } = useQuery(
    ['findAllThings'],
    async () => request('/api/graphql', GET_THINGS),
    {
      onError: (err) => {
        console.log(err);
      },
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const [createThing, { status: createThingStatus }] = useMutation(
    async (variables) => request('/api/graphql', CREATE_THING, variables),
    {
      onMutate: ({ data }) => {
        queryCache.cancelQueries('findAllThings');
        const previousValue = queryCache.getQueryData('findAllThings');
        const newThing = {
          _id: 'temp-id',
          name: data.name,
        };
        /* The value returned from this function will be passed to both the onError
         * and onSettled functions in the event of a mutation failure and can be useful
         * for rolling back optimistic updates
         */
        const newData = {
          findAllThings: {
            data: [...previousValue.findAllThings.data, newThing],
          },
        };

        queryCache.setQueryData('findAllThings', newData);
        return previousValue;
      },
      onSuccess: ({ createThing }) => {
        queryCache.cancelQueries('findAllThings');
        const currentValue = queryCache.getQueryData('findAllThings');
        const thingsWithoutLast = currentValue.findAllThings.data.slice(
          0,
          currentValue.findAllThings.data.length - 1
        );
        /* To replace the `temp-id` */
        const newLastThing = {
          _id: createThing._id,
          name: createThing.name,
        };
        const newData = {
          findAllThings: {
            data: [...thingsWithoutLast, newLastThing],
          },
        };

        queryCache.setQueryData('findAllThings', newData);
        console.log('Create success', newData);
        setIsCreating(false);
      },
      onError: (err, variables, previousValue) => {
        console.log(err.message);
        queryCache.setQueryData('findAllThings', previousValue);
      },
    }
  );

  const handleCreateThing = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new window.FormData(form);
    const thingName = formData.get('name');

    await createThing({
      data: {
        owner: {
          connect: id,
        },
        name: thingName,
      },
    });
    form.reset();
  };

  let thingsList;
  if (things) {
    thingsList = [...things.findAllThings.data]
      .reverse()
      .map((thing) => (
        <Thing key={thing._id} id={thing._id} name={thing.name} />
      ));
  }

  return (
    <div>
      <div>
        {isCreating ? (
          <>
            <form onSubmit={handleCreateThing}>
              <input
                placeholder="thing name"
                name="name"
                type="text"
                required
              />
              <button
                type="submit"
                className="btn"
                disabled={createThingStatus === 'loading'}
              >
                Submit
              </button>
              <button
                className="btn"
                onClick={() => setIsCreating(false)}
                disabled={createThingStatus === 'loading'}
              >
                Cancel
              </button>
            </form>
          </>
        ) : (
          <button className="btn" onClick={() => setIsCreating(true)}>
            Create thing
          </button>
        )}
      </div>
      <p>List of things (click the list item text to update)</p>
      <ul>{isFetching ? <span>loading...</span> : thingsList}</ul>
      <style jsx>{`
        .btn {
          display: inline-block;
          margin-left: 5px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}
