/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/log', 'N/search'],

function(record, log, search) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function _beforeLoad(context) {



        try{
          var messageRec = context.newRecord;

          searchContacts(messageRec);
        }
        catch(e){
          log.error({title:'error',details:e});
        }



    }

    function searchContacts(messageRec){

      var entity = messageRec.getValue({fieldId:'recipient'});
      log.debug({title:'entity',details:entity});
      var contactSearch = search.create({
    		   type: "contact",
    		   filters:
    		   [
    		      ["company","anyof",entity],
              "AND",
              ["custentity_sik_billing_contact","is","T"]
    		   ],
    		   columns:
    		   [
    		      search.createColumn({name: "email", label: "Email"}),
              search.createColumn({name: "internalid", label: "Internal ID"}),
    		   ]
    		});
    		var searchResultCount = contactSearch.runPaged().count;
    		log.debug("contactSearch result count",searchResultCount);
        var i = 0;

        if(searchResultCount > 0){
          contactSearch.run().each(function(result){
      		   // .run().each has a limit of 4,000 results

      			var contactId = result.getValue({name: "internalid"});
            var email = result.getValue({name: "email"});

            log.debug({title:'contactId :'+i,details:contactId});

            messageRec.setSublistValue({
                sublistId: 'otherrecipientslist',
                fieldId: 'email',
                line: i,
                value: email
            });

            messageRec.setSublistValue({
                sublistId: 'otherrecipientslist',
                fieldId: 'otherrecipient',
                line: i,
                value: contactId
            });

            messageRec.setSublistValue({
                sublistId: 'otherrecipientslist',
                fieldId: 'cc',
                line: i,
                value: true
            });


            i++;


      		   return true;
      		});

        }





    }

    return {
        beforeLoad: _beforeLoad
    };

});
