import React, { useState } from 'react';
import { useMutation, queryCache } from 'react-query';
import { request } from 'graphql-request';

const DELETE_THING = `
  mutation DeleteThing($id: ID!) {
    deleteThing(id: $id) {
      _id
    }
  }
`;

const UPDATE_THING = `
  mutation UpdateThing($id: ID!, $data: ThingInput!) {
    updateThing(id: $id, data: $data) {
      _id
      name
    }
  }
`;

export default function Thing({ id, name }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!name) name = <i>empty</i>;

  const [deleteThing, { isLoading: isDeleteThingLoading }] = useMutation(
    async (variables) => request('/api/graphql', DELETE_THING, variables),
    {
      onMutate: ({ id }) => {
        queryCache.cancelQueries('findAllThings');
        const previousValue = queryCache.getQueryData('findAllThings');
        /* The value returned from this function will be passed to both the onError
         * and onSettled functions in the event of a mutation failure and can be useful
         * for rolling back optimistic updates
         */
        const newData = {
          findAllThings: {
            data: previousValue.findAllThings.data.filter((o) => o._id !== id),
          },
        };

        queryCache.setQueryData('findAllThings', newData);
        return previousValue;
      },
      onSuccess: (data) => {
        console.log('Delete success', data);
      },
      onError: (err, variables, previousValue) => {
        console.log(err);
        queryCache.setQueryData('findAllThings', previousValue);
      },
    }
  );

  const [updateThing, { isLoading: isUpdateThingLoading }] = useMutation(
    async (variables) => request('/api/graphql', UPDATE_THING, variables),
    {
      onMutate: ({ data, id }) => {
        queryCache.cancelQueries('findAllThings');
        const previousValue = queryCache.getQueryData('findAllThings');
        /* The value returned from this function will be passed to both the onError
         * and onSettled functions in the event of a mutation failure and can be useful
         * for rolling back optimistic updates
         */
        const newData = {
          findAllThings: {
            data: previousValue.findAllThings.data.map((el) => {
              if (el._id === id) {
                return Object.assign({}, el, { name: data.name });
              }
              return el;
            }),
          },
        };
        queryCache.setQueryData('findAllThings', newData);
        return previousValue;
      },
      onSuccess: (data) => {
        console.log('Update success', data);
      },
      onError: (err, variables, previousValue) => {
        console.log(err);
        queryCache.setQueryData('findAllThings', previousValue);
      },
    }
  );

  const handleUpdateThing = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new window.FormData(form);
    const thingName = formData.get('name');

    await updateThing({
      data: {
        name: thingName,
      },
      id,
    });
    form.reset();
    setIsUpdating(false);
  };

  let fullRender = (
    <li>
      <span onClick={() => setIsUpdating(true)}>{name}</span>
      <button
        className="btn"
        onClick={() => setIsDeleting(true)}
        disabled={
          isDeleteThingLoading === 'loading' ||
          isUpdateThingLoading === 'loading'
        }
      >
        Delete
      </button>
      <style jsx>{`
        .btn {
          display: inline;
          margin-left: 5px;
          margin-bottom: 5px;
        }
      `}</style>
    </li>
  );
  if (!isDeleting && isUpdating) {
    fullRender = (
      <li>
        <form onSubmit={handleUpdateThing}>
          <input placeholder="thing name" name="name" type="text" required />
          <button
            className="btn"
            onClick={() => setIsUpdating(false)}
            disabled={
              isDeleteThingLoading === 'loading' ||
              isUpdateThingLoading === 'loading'
            }
          >
            Cancel
          </button>
          <button
            className="btn"
            type="submit"
            disabled={
              isDeleteThingLoading === 'loading' ||
              isUpdateThingLoading === 'loading'
            }
          >
            Yes, update
          </button>
        </form>
        <style jsx>{`
          .btn {
            display: inline;
            margin-left: 5px;
            margin-bottom: 5px;
          }
        `}</style>
      </li>
    );
  }
  if (isDeleting && !isUpdating) {
    fullRender = (
      <li>
        <span>{name}</span>
        <button
          className="btn"
          onClick={() => setIsDeleting(false)}
          disabled={
            isDeleteThingLoading === 'loading' ||
            isUpdateThingLoading === 'loading'
          }
        >
          Cancel
        </button>
        <button
          className="btn"
          onClick={async () => await deleteThing({ id: id })}
          disabled={
            isDeleteThingLoading === 'loading' ||
            isUpdateThingLoading === 'loading'
          }
        >
          Yes, delete
        </button>
        <style jsx>{`
          .btn {
            display: inline;
            margin-left: 5px;
            margin-bottom: 5px;
          }
        `}</style>
      </li>
    );
  }

  return fullRender;
}
