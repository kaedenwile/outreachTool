# import connector
# from connector import errorcode

print('Loading function')

def lambda_handler(event, context):
    '''Provide an event that contains the following keys:

      - operation: one of the operations in the operations dict below
      - tableName: required for operations that interact with DynamoDB
      - payload: a parameter to pass to the operation being performed
    '''
    import my_mysql
    from my_mysql.connector import errorcode

    if 'data' in event.keys() and 'type' in event.keys() and 'deeper' in event.keys():
        try: cnx = my_mysql.connector.connect(user='<USERNAME>', password='<PASSWORD>',
                                      host='<AMAZON RDS URL>',
                                      database='<DATABASE NAME>')

        except my_mysql.connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                print("Something is wrong with your user name or password")
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                print("Database does not exist")
            else:
                print(err)
        else:
            query1 = 'INSERT INTO data (owner, numSkunks, numMentors, hours, date, type, notes, validated) VALUES ("' \
                    + str(event["data"]["owner"])+'", "' \
                    + str(event["data"]["numSkunks"]) + '", "' \
                    + str(event["data"]["numMentors"]) + '", "' \
                    + str(event["data"]["hours"]) + '", "' \
                    + str(event["data"]["date"]) + '", "' \
                    + str(event["type"]) + '", "' \
                    + str(event["notes"]) + '", "FALSE")';

            cursor = cnx.cursor()
            cursor.execute(query1)
            cnx.commit()

            query2Keys = "(id"
            query2Vals = '("'+str(cursor.lastrowid)+'"'
            for key, value in event["deeper"].iteritems():
                query2Keys += ", "+str(key)
                query2Vals += ', "'+str(value)+'"'
            query2Keys += ")"
            query2Vals += ")"

            query2 = 'INSERT INTO ' + str(event["type"]) + 'DATA '+query2Keys+' VALUES '+query2Vals
            # return query2

            cursor.execute(query2)
            cnx.commit()

            if 'other' in event.keys():
                for other in event["other"].iteritems():
                    query = "INSERT INTO dynamicDropDown (dropDown, value, label) VALUES ("+other["list"] + \
                            ", "+other["value"]+", "+other["label"]+");";
                    cursor.execut(query)
                cnx.commit()

            cursor.close()
            cnx.close()
